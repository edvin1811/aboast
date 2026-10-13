// Blog illustrations: checks them, and renders content/illustrations/*.json
// to public/blog/img/<slug>/<name>.jpg in one go (build, start the site with
// the preview route on, take the pictures, stop the site).
//
//   npm run illustrations                render illustrations that have no JPG yet
//   npm run illustrations -- <slug> ...  render these posts' illustrations again
//   npm run illustrations -- --all       render every illustration again
//   npm run illustrations -- --check     only report problems, render nothing
//   add --no-build to reuse the last build when only JSON files changed
//
// Needs Playwright's Chromium once: npx playwright install chromium
// (or set PLAYWRIGHT to the path of another Playwright install).
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";

const ROOT = process.cwd();
const BLOG = path.join(ROOT, "content", "blog");
const SPECS = path.join(ROOT, "content", "illustrations");
const IMG = path.join(ROOT, "public", "blog", "img");
const NEXT = path.join(ROOT, "node_modules", "next", "dist", "bin", "next");
const TYPES = ["quotes", "email", "steps", "compare", "checklist", "tiles", "timeline", "fanout", "bars"];

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const slugs = args.filter((a) => !a.startsWith("--"));

/** Names from a `NAME: Record<…> = { key: … }` table in a component file. */
function keysOf(file, table) {
  const src = fs.readFileSync(path.join(ROOT, "components", "illustrations", file), "utf8");
  const start = src.indexOf(table);
  const block = src.slice(start, src.indexOf("};", start));
  return new Set([...block.matchAll(/\b([a-z]+):\s*["A-Z]/g)].map((m) => m[1]));
}

function icons() {
  const src = fs.readFileSync(path.join(ROOT, "components", "illustrations", "icons.tsx"), "utf8");
  const block = src.slice(src.indexOf("ICONS"), src.indexOf("};", src.indexOf("ICONS")));
  return new Set([...block.matchAll(/\b([a-z]+):\s*[A-Z]/g)].map((m) => m[1]));
}

/** Calls fn(key, value) for every string in a spec, arrays included. */
function walk(node, fn, key) {
  if (Array.isArray(node)) node.forEach((v) => walk(v, fn, key));
  else if (node && typeof node === "object") for (const [k, v] of Object.entries(node)) walk(v, fn, k);
  else if (typeof node === "string") fn(key, node);
}

/** Everything that's wrong or missing, as plain sentences. */
function check() {
  const posts = fs.readdirSync(BLOG).filter((f) => f.endsWith(".md")).map((f) => f.slice(0, -3));
  const iconNames = icons();
  const sources = keysOf("illustration.tsx", "SOURCES");
  const problems = [];
  const todo = [];
  const withoutImages = [];
  const specs = new Map();

  for (const file of fs.readdirSync(SPECS).filter((f) => f.endsWith(".json"))) {
    const slug = file.slice(0, -5);
    let list;
    try {
      list = JSON.parse(fs.readFileSync(path.join(SPECS, file), "utf8"));
    } catch (e) {
      problems.push(`content/illustrations/${file} is not valid JSON: ${e.message}`);
      continue;
    }
    if (!posts.includes(slug)) problems.push(`content/illustrations/${file} has no post content/blog/${slug}.md`);
    const names = new Set();
    for (const spec of list) {
      const where = `${slug}/${spec.name ?? "?"}`;
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(spec.name ?? "")) problems.push(`${where}: "name" must be lowercase words joined by hyphens`);
      if (names.has(spec.name)) problems.push(`${where}: two illustrations share this name`);
      names.add(spec.name);
      if (!TYPES.includes(spec.type)) problems.push(`${where}: unknown type "${spec.type}" (use ${TYPES.join(", ")})`);
      walk(spec, (key, value) => {
        if (key === "source" && typeof value === "string" && !sources.has(value)) problems.push(`${where}: unknown source "${value}" (use ${[...sources].join(", ")})`);
        if (key === "icon" && !iconNames.has(value)) problems.push(`${where}: unknown icon "${value}" (see components/illustrations/icons.tsx)`);
        if (typeof value === "string" && /\d\s?%/.test(value)) problems.push(`${where}: "${value}" has a percentage; illustrations show example content, not statistics`);
      });
    }
    specs.set(slug, list);
  }

  for (const slug of posts) {
    const md = fs.readFileSync(path.join(BLOG, `${slug}.md`), "utf8");
    const refs = [...md.matchAll(/!\[[^\]]*\]\((\/blog\/img\/[^\s)]+)/g)].map((m) => m[1]);
    if (!refs.length) withoutImages.push(slug);
    for (const ref of refs) {
      const fromSpec = ref.match(/^\/blog\/img\/([^/]+)\/([^/]+)\.jpg$/);
      const known = fromSpec && specs.get(fromSpec[1])?.some((s) => s.name === fromSpec[2]);
      if (!fs.existsSync(path.join(ROOT, "public", ref)) && !known) problems.push(`content/blog/${slug}.md links to ${ref}, which doesn't exist`);
    }
    for (const spec of specs.get(slug) ?? []) {
      const src = `/blog/img/${slug}/${spec.name}.jpg`;
      if (!fs.existsSync(path.join(IMG, slug, `${spec.name}.jpg`))) todo.push({ slug, spec });
      if (!refs.includes(src)) problems.push(`${slug}/${spec.name} isn't in the post yet: add ![alt](${src} "Caption") under its heading`);
    }
  }
  return { problems, todo, withoutImages, specs };
}

function report({ problems, withoutImages }) {
  if (withoutImages.length) console.log(`\nPosts without an illustration (${withoutImages.length}):\n${withoutImages.map((s) => `  - ${s}`).join("\n")}`);
  if (problems.length) console.log(`\nProblems (${problems.length}):\n${problems.map((p) => `  - ${p}`).join("\n")}`);
  if (!withoutImages.length && !problems.length) console.log("\nAll posts have illustrations and nothing is broken.");
}

function freePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer().once("error", reject);
    srv.listen(0, () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

function stop(child) {
  if (!child || child.exitCode !== null) return;
  if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"]);
  else {
    try {
      process.kill(-child.pid, "SIGTERM");
    } catch {
      child.kill("SIGTERM");
    }
  }
}

async function render(jobs) {
  let chromium;
  try {
    ({ chromium } = await import(process.env.PLAYWRIGHT ?? "playwright"));
  } catch {
    throw new Error("Playwright isn't installed. Run: npm install && npx playwright install chromium");
  }

  let browser;
  try {
    browser = await chromium.launch();
  } catch (e) {
    throw new Error(`Chromium didn't start. Run: npx playwright install chromium\n${e.message.split("\n")[0]}`);
  }

  if (!flags.has("--no-build") || !fs.existsSync(path.join(ROOT, ".next", "BUILD_ID"))) {
    console.log("Building the site…");
    const build = spawnSync(process.execPath, [NEXT, "build"], { stdio: "inherit", cwd: ROOT });
    if (build.status !== 0) {
      await browser.close();
      throw new Error("next build failed; fix the error above and run again");
    }
  }

  const port = await freePort();
  const base = `http://localhost:${port}`;
  const server = spawn(process.execPath, [NEXT, "start", "-p", String(port)], {
    cwd: ROOT,
    env: { ...process.env, ILLUSTRATIONS: "1" },
    stdio: ["ignore", "ignore", "inherit"],
    detached: process.platform !== "win32",
  });
  const cleanup = () => stop(server);
  process.on("exit", cleanup);
  process.on("SIGINT", () => process.exit(130));

  try {
    const first = `${base}/illustrations/${jobs[0].slug}/${jobs[0].spec.name}`;
    for (let i = 0; ; i++) {
      if (server.exitCode !== null) throw new Error("the site stopped before it was ready");
      const ok = await fetch(first).then((r) => r.ok, () => false);
      if (ok) break;
      if (i > 120) throw new Error(`the site didn't answer on ${base}`);
      await new Promise((r) => setTimeout(r, 500));
    }

    // 1200px canvas at 4/3 density: 1600px-wide images, sharp at the blog's
    // 768px column on retina screens.
    const page = await browser.newPage({ viewport: { width: 1320, height: 1000 }, deviceScaleFactor: 4 / 3 });
    for (const { slug, spec } of jobs) {
      const url = `${base}/illustrations/${slug}/${spec.name}`;
      const res = await page.goto(url, { waitUntil: "networkidle" });
      if (!res?.ok()) throw new Error(`${url} returned ${res?.status()}`);
      await page.evaluate(() => document.fonts.ready);
      fs.mkdirSync(path.join(IMG, slug), { recursive: true });
      const out = path.join(IMG, slug, `${spec.name}.jpg`);
      await page.locator("#illustration").screenshot({ path: out, type: "jpeg", quality: 86 });
      console.log("saved", path.relative(ROOT, out));
    }
  } finally {
    await browser.close();
    cleanup();
  }
}

try {
  const state = check();
  if (!flags.has("--check")) {
    const all = [...state.specs].flatMap(([slug, list]) => list.map((spec) => ({ slug, spec })));
    const unknown = slugs.filter((s) => !state.specs.has(s));
    if (unknown.length) throw new Error(`No content/illustrations/<slug>.json for: ${unknown.join(", ")}`);
    const jobs = flags.has("--all") ? all : slugs.length ? all.filter((j) => slugs.includes(j.slug)) : state.todo;
    if (jobs.length) {
      await render(jobs);
      console.log(`\n${jobs.length} illustration${jobs.length === 1 ? "" : "s"} saved.`);
    } else console.log("Every illustration already has a JPG. Pass a post slug or --all to render again.");
  }
  const after = check();
  report(after);
  process.exitCode = after.problems.length ? 1 : 0;
} catch (e) {
  console.error(`\n${e.message}`);
  process.exitCode = 1;
}
