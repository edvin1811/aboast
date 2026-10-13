import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { getAllPosts, serializePost, type BlogPost } from "@/lib/blog";
import { buildRetryHint, internalLinks, pickTopic, POST_SCHEMA, stripUnknownLinks, SYSTEM_PROMPT, tidyMarkdown, validate, type Draft } from "@/lib/blog-writer";

/**
 * A blog post written by Claude and published by committing a Markdown file
 * to content/blog in the GitHub repo. The push triggers a Vercel deploy, so
 * the post is live a couple of minutes later as a static page — no CMS.
 *
 * On demand only: there is no schedule, so posts go up when someone chooses
 * to (add a cron to vercel.json to change that). Call it with the CRON_SECRET
 * as a bearer token, or add posts to content/blog by hand.
 *
 * Env: ANTHROPIC_API_KEY, CRON_SECRET, GITHUB_TOKEN (fine-grained, Contents
 * read/write on the repo). Optional: BLOG_REPO (owner/name), BLOG_BRANCH,
 * BLOG_PATH. Add ?dry=1 to get the draft back without committing, and
 * ?topic=... to write about something specific.
 */

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const CRON_SECRET = process.env.CRON_SECRET;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const BLOG_REPO = process.env.BLOG_REPO || "edvin1811/aboast";
const BLOG_BRANCH = process.env.BLOG_BRANCH || "main";
const BLOG_PATH = process.env.BLOG_PATH || "frontend/content/blog";
const MODEL = "claude-opus-5-5";

/* ---------- Claude ---------- */

let anthropic: Anthropic | null = null;

async function callClaude(topic: string, links: string, retryHint?: string): Promise<{ draft: Draft | null; stopReason: string }> {
  anthropic ??= new Anthropic({ apiKey: ANTHROPIC_API_KEY });
  const userText = `Write a blog post about: ${topic}\n\n${retryHint ? `${retryHint}\n\n` : ""}Return ONLY by calling submit_blog_post. The post must be original, specific, and concrete.`;
  const message = await anthropic.beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    // Opus 5.5 always thinks; effort is the only dial, and it defaults to medium.
    output_config: { effort: "high" },
    // A request the model declines is re-run on a fallback model by the API
    // instead of coming back as a refusal.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: `${SYSTEM_PROMPT}\n\nINTERNAL LINKS (the only paths you may link to):\n${links}`,
    tools: [{ name: "submit_blog_post", description: "Submit the final blog post for publication.", input_schema: POST_SCHEMA as Anthropic.Beta.BetaTool.InputSchema }],
    // Opus 5.5 rejects a forced tool_choice. The prompt asks for the tool, and
    // an answer without the call is retried like any other failed draft.
    tool_choice: { type: "auto" },
    messages: [{ role: "user", content: userText }],
  });
  const call = message.content.find((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use" && b.name === "submit_blog_post");
  return { draft: call ? (call.input as Draft) : null, stopReason: message.stop_reason ?? "unknown" };
}

/* ---------- GitHub ---------- */

const GITHUB_HEADERS = () => ({
  Authorization: `Bearer ${GITHUB_TOKEN}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "aboast-blog-writer",
});

/** Creates content/blog/<slug>.md on the branch. Never overwrites: if the
 *  file exists (a post from today that isn't deployed yet), tries -2, -3… */
async function commitPost(post: BlogPost): Promise<{ slug: string; url: string }> {
  let slug = post.slug;
  for (let n = 2; n <= 6; n++) {
    const res = await fetch(`https://api.github.com/repos/${BLOG_REPO}/contents/${BLOG_PATH}/${slug}.md`, {
      method: "PUT",
      headers: GITHUB_HEADERS(),
      body: JSON.stringify({
        message: `Blog: ${post.title}`,
        content: Buffer.from(serializePost({ ...post, slug }), "utf8").toString("base64"),
        branch: BLOG_BRANCH,
      }),
    });
    if (res.ok) {
      const json = await res.json();
      return { slug, url: json.content?.html_url ?? "" };
    }
    // 422 without a sha means the file already exists.
    if (res.status !== 422) throw new Error(`github_${res.status}: ${(await res.text()).slice(0, 300)}`);
    slug = `${post.slug.slice(0, 56)}-${n}`;
  }
  throw new Error("github_slug_taken");
}

/* ---------- Handler ---------- */

export async function GET(req: Request) {
  // This endpoint spends API credits and commits to the repo: it must not be
  // callable by anyone who finds the URL. Vercel Cron sends this header when
  // CRON_SECRET is set in the project.
  if (!CRON_SECRET) return NextResponse.json({ error: "CRON_SECRET is not set" }, { status: 500 });
  if (req.headers.get("authorization") !== `Bearer ${CRON_SECRET}`) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const dryRun = url.searchParams.get("dry") === "1";
  if (!ANTHROPIC_API_KEY) return NextResponse.json({ error: "ANTHROPIC_API_KEY is not set" }, { status: 500 });
  if (!dryRun && !GITHUB_TOKEN) return NextResponse.json({ error: "GITHUB_TOKEN is not set" }, { status: 500 });

  const posts = getAllPosts();
  const topic = url.searchParams.get("topic") ?? pickTopic(posts);
  if (!topic) {
    console.warn("[cron/publish] skip: every topic in lib/blog-writer.ts has a post; add more");
    return NextResponse.json({ skipped: true, reason: "no_fresh_topics" });
  }
  const links = internalLinks(posts);

  try {
    let draft: Draft | undefined;
    let v: ReturnType<typeof validate> = { ok: false, reason: "not_attempted" };
    let hint: string | undefined;
    let attempts = 0;
    for (attempts = 1; ; attempts++) {
      const { draft: candidate, stopReason } = await callClaude(topic, links.list, hint);
      draft = candidate ?? undefined;
      // A cut-off generation can still parse; don't trust a non-tool_use stop.
      v = !candidate
        ? { ok: false, reason: stopReason === "end_turn" ? "no_tool_call" : `incomplete_generation_${stopReason}` }
        : stopReason !== "tool_use"
          ? { ok: false, reason: `incomplete_generation_${stopReason}` }
          : validate(candidate);
      if (v.ok || attempts === 3) break;
      console.warn("[cron/publish] attempt failed, retrying", { topic, attempt: attempts, reason: v.reason });
      hint = buildRetryHint(v.reason);
    }
    if (!v.ok) {
      console.warn("[cron/publish] skip: validation failed after retries", { topic, attempts, reason: v.reason });
      return NextResponse.json({ skipped: true, topic, attempts, reason: v.reason });
    }
    if (!draft) throw new Error("no_draft");

    const { markdown, removed } = stripUnknownLinks(tidyMarkdown(draft.content_markdown), links.paths);
    if (removed.length) console.warn("[cron/publish] removed links outside the allowed list", { removed });

    const taken = new Set(posts.map((p) => p.slug));
    let slug = draft.slug;
    for (let n = 2; taken.has(slug); n++) slug = `${draft.slug.slice(0, 56)}-${n}`;

    const post: BlogPost = {
      title: draft.title,
      slug,
      excerpt: draft.excerpt,
      date: new Date().toISOString(),
      author: "Edvin Åslund",
      topic,
      tags: draft.tags,
      body: markdown,
    };

    if (dryRun) return NextResponse.json({ ok: true, dryRun: true, topic, attempts, words: v.wc, removedLinks: removed, file: serializePost(post) });

    const result = await commitPost(post);
    console.log("[cron/publish] committed", { topic, slug: result.slug, attempts, words: v.wc });
    return NextResponse.json({ ok: true, topic, slug: result.slug, commit: result.url, attempts, words: v.wc, removedLinks: removed });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[cron/publish] error", { topic, err: message });
    return NextResponse.json({ error: message, topic }, { status: 500 });
  }
}
