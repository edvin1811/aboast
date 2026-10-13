import fs from "node:fs";
import path from "node:path";
import { Marked } from "marked";

/**
 * Blog posts live in content/blog/<slug>.md: front matter, then Markdown.
 * Every page is built from these files at build time, so the blog is static
 * HTML with no CMS or database behind it. To publish, add a file and push;
 * the on-demand writer (app/api/cron/publish) does the same through the
 * GitHub API.
 *
 * Front matter is one `key: <JSON value>` per line, so strings with colons,
 * quotes or emoji need no YAML escaping rules — parsePost and serializePost
 * are the only readers and writers.
 */

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  /** ISO timestamp. */
  date: string;
  /** ISO timestamp of the last real edit, when there was one. */
  updated?: string;
  author: string;
  seoTitle?: string;
  seoDescription?: string;
  /** Path under /public, e.g. /blog/covers/slug.png. Optional. */
  cover?: string;
  /** The writer topic that produced the post, so topics aren't repeated. */
  topic?: string;
  tags?: string[];
  /** Markdown. */
  body: string;
};

const FIELDS = ["title", "slug", "excerpt", "date", "updated", "author", "seoTitle", "seoDescription", "cover", "topic", "tags"] as const;

export const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export function parsePost(raw: string, file = "post"): BlogPost {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error(`${file}: missing front matter`);
  const meta: Record<string, unknown> = {};
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim()) continue;
    const i = line.indexOf(":");
    if (i < 0) throw new Error(`${file}: bad front matter line "${line}"`);
    meta[line.slice(0, i).trim()] = JSON.parse(line.slice(i + 1).trim());
  }
  for (const key of ["title", "slug", "excerpt", "date"] as const) {
    if (typeof meta[key] !== "string" || !meta[key]) throw new Error(`${file}: front matter needs "${key}"`);
  }
  const fields = meta as Omit<BlogPost, "body">;
  return { ...fields, author: fields.author || "Edvin Åslund", body: match[2].trim() };
}

export function serializePost(post: BlogPost): string {
  const lines = FIELDS.filter((k) => post[k] !== undefined && post[k] !== "").map((k) => `${k}: ${JSON.stringify(post[k])}`);
  return `---\n${lines.join("\n")}\n---\n\n${post.body.trim()}\n`;
}

let cache: BlogPost[] | null = null;

/** Every post, newest first. */
export function getAllPosts(): BlogPost[] {
  if (cache) return cache;
  const files = fs.existsSync(BLOG_DIR) ? fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md")) : [];
  cache = files
    .map((f) => {
      const post = parsePost(fs.readFileSync(path.join(BLOG_DIR, f), "utf8"), f);
      if (post.slug !== f.replace(/\.md$/, "")) throw new Error(`${f}: slug "${post.slug}" doesn't match the file name`);
      return post;
    })
    .sort((a, b) => b.date.localeCompare(a.date));
  return cache;
}

export function getPost(slug: string): BlogPost | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

/** Up to `count` other posts, the ones sharing the most tags first, then the
 *  newest — for "Keep reading" under a post. */
export function relatedPosts(post: BlogPost, count = 3): BlogPost[] {
  const tags = new Set(post.tags ?? []);
  return getAllPosts()
    .filter((p) => p.slug !== post.slug)
    .map((p, i) => ({ p, i, shared: (p.tags ?? []).filter((t) => tags.has(t)).length }))
    .sort((a, b) => b.shared - a.shared || a.i - b.i)
    .slice(0, count)
    .map(({ p }) => p);
}

const escapeAttr = (value: string) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/** Markdown to HTML for .prose-aboast. Images become lazy-loaded figures
 *  (the title in `![alt](src "caption")` is the caption), links that leave
 *  the site open in a new tab, and tables get the scroll wrapper the prose
 *  styles expect so wide tables scroll instead of breaking the page. */
const md = new Marked({
  gfm: true,
  renderer: {
    image({ href, title, text }) {
      const img = `<img src="${escapeAttr(href)}" alt="${escapeAttr(text)}" loading="lazy" decoding="async" />`;
      return title ? `<figure>${img}<figcaption>${escapeAttr(title)}</figcaption></figure>` : img;
    },
    link({ href, title, tokens }) {
      const text = this.parser.parseInline(tokens);
      const external = /^https?:\/\//.test(href) && !/^https?:\/\/(www\.)?aboast\.com/.test(href);
      const attrs = external ? ' target="_blank" rel="noopener"' : "";
      return `<a href="${escapeAttr(href)}"${title ? ` title="${escapeAttr(title)}"` : ""}${attrs}>${text}</a>`;
    },
  },
});

export function renderMarkdown(markdown: string): string {
  const html = md.parse(markdown, { async: false });
  return html.replace(/<table>/g, '<div class="table-scroll"><table>').replace(/<\/table>/g, "</table></div>");
}

export function plainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function wordCount(markdown: string): number {
  return plainText(markdown).split(" ").filter(Boolean).length;
}

export function readingTime(markdown: string): string {
  return `${Math.max(1, Math.round(wordCount(markdown) / 220))} min read`;
}

export function formatPostDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}
