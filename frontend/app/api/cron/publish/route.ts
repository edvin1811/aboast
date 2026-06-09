import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL!;
const STRAPI_TOKEN = process.env.STRAPI_TOKEN!;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;
const CRON_SECRET = process.env.CRON_SECRET;
const MODEL = "claude-sonnet-4-6";

/**
 * 30+ seed topics covering aboast's SEO clusters. Daily cron rotates
 * deterministically by day-of-epoch so no repeat within 30 days. Edit
 * freely — add more for longer rotation, reorder to change ordering.
 */
const TOPICS = [
  "How to collect customer testimonials without feeling awkward",
  "Wall of love best practices for SaaS landing pages",
  "Video testimonials vs written testimonials: real conversion data",
  "Embedding testimonials in Next.js without slowing your site",
  "Testimonial widget A/B testing: what actually moves trial signups",
  "Writing case studies for B2B SaaS that don't put readers to sleep",
  "Schema markup for review stars: a step-by-step guide",
  "Reducing friction in testimonial request emails",
  "Best testimonial collection email templates for SaaS",
  "How to ask for a testimonial without sounding desperate",
  "Turning Slack messages into testimonial gold",
  "Social proof above the fold: the hierarchy that converts",
  "Why your testimonials aren't converting (and the fix)",
  "Testimonial consent and GDPR: a founder's guide",
  "How to handle negative reviews without losing trust",
  "Senja vs Testimonial.to vs Endorsal: an honest comparison",
  "Building credibility before you have customers",
  "From happy reply to published testimonial in under 5 minutes",
  "Customer quotes that actually read like humans wrote them",
  "Star ratings, badges, and stamps: what works in 2026",
  "How to use testimonials in cold outreach without being cringe",
  "Onboarding flows that automatically capture social proof",
  "Showcasing testimonials in product UI without being thirsty",
  "Logo walls that don't look like 2014",
  "Testimonial-driven landing pages: the modular playbook",
  "When to use a video vs text testimonial on a page",
  "Building a public Wall of Love that drives signups",
  "Tracking which testimonial actually converted a customer",
  "Avoiding the 'AI-generated' testimonial smell",
  "From free trial to glowing quote: the timing playbook",
  "Repurposing testimonials across LinkedIn, X, and landing pages",
  "Testimonial micro-copy: the words that earn the click",
];

function pickTopic(): string {
  const day = Math.floor(Date.now() / 86_400_000);
  return TOPICS[day % TOPICS.length];
}

/* ---------- Strapi blocks JSON schema (matches frontend BlockNode) ---------- */

const INLINE_NODE = {
  oneOf: [
    {
      type: "object",
      required: ["type", "text"],
      additionalProperties: false,
      properties: {
        type: { const: "text" },
        text: { type: "string" },
        bold: { type: "boolean" },
        italic: { type: "boolean" },
      },
    },
    {
      type: "object",
      required: ["type", "url", "children"],
      additionalProperties: false,
      properties: {
        type: { const: "link" },
        url: { type: "string" },
        children: {
          type: "array",
          items: {
            type: "object",
            required: ["type", "text"],
            additionalProperties: false,
            properties: { type: { const: "text" }, text: { type: "string" } },
          },
        },
      },
    },
  ],
};

const POST_SCHEMA = {
  type: "object",
  required: [
    "title",
    "slug",
    "excerpt",
    "content",
    "target_keyword",
    "tags",
  ],
  additionalProperties: false,
  properties: {
    title: { type: "string", minLength: 20, maxLength: 70 },
    slug: { type: "string", pattern: "^[a-z0-9-]+$", maxLength: 60 },
    excerpt: { type: "string", minLength: 140, maxLength: 165 },
    target_keyword: { type: "string" },
    tags: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: { type: "string" },
    },
    content: {
      type: "array",
      minItems: 8,
      items: {
        oneOf: [
          {
            type: "object",
            required: ["type", "children"],
            additionalProperties: false,
            properties: {
              type: { const: "paragraph" },
              children: { type: "array", items: INLINE_NODE },
            },
          },
          {
            type: "object",
            required: ["type", "level", "children"],
            additionalProperties: false,
            properties: {
              type: { const: "heading" },
              level: { type: "integer", minimum: 2, maximum: 3 },
              children: { type: "array", items: INLINE_NODE },
            },
          },
          {
            type: "object",
            required: ["type", "format", "children"],
            additionalProperties: false,
            properties: {
              type: { const: "list" },
              format: { enum: ["ordered", "unordered"] },
              children: {
                type: "array",
                items: {
                  type: "object",
                  required: ["type", "children"],
                  additionalProperties: false,
                  properties: {
                    type: { const: "list-item" },
                    children: { type: "array", items: INLINE_NODE },
                  },
                },
              },
            },
          },
          {
            type: "object",
            required: ["type", "children"],
            additionalProperties: false,
            properties: {
              type: { const: "quote" },
              children: { type: "array", items: INLINE_NODE },
            },
          },
        ],
      },
    },
  },
};

const SYSTEM_PROMPT = `You are Edvinas Lund, founder of aboast.com — a SaaS product that helps companies collect, manage, and embed customer testimonials. You write the blog. Voice: first-person, founder-style, concrete, never corporate. Like a smart friend explaining what actually works, not a marketer.

Use the submit_blog_post tool. Output ONLY by calling that tool.

CONTENT RULES:
- Length: 1200–1800 words across all paragraph + list-item text combined.
- Structure: open with a 1–2 paragraph hook that names the problem from the reader's side. Then 4–6 H2 sections. Each H2 may contain H3 sub-sections, paragraphs, lists, and quotes. End with a one-paragraph wrap that invites the reader to try aboast.
- Title: 50–65 chars, target keyword near the start, no clickbait, no colons unless useful.
- Excerpt: 140–160 chars, includes target keyword, ends with a hook the reader wants to resolve.
- Slug: lowercase-kebab-case, target keyword first, max 60 chars.
- Include ONE original aboast data point framed as "From what we've seen at aboast…" — use plausible internal numbers (response rates 40-70%, time-to-first-testimonial 2-7 days, CTRs 1-4%). Do not invent specific external statistics — speak qualitatively about industry trends ("most teams find…", "in our experience…").
- Internal links: 2-3 link blocks pointing to /blog/<plausible-slug> for related topics.
- One linked quote or anecdote per post is fine; don't lard the piece with quotes.
- Banned words: "leverage", "unlock", "harness", "elevate", "supercharge", "ultimate guide", "in today's fast-paced world".

SEO RULES:
- target_keyword: 2–4 words, the phrase a buyer would type.
- Use target_keyword in: title, the first paragraph, exactly one H2, and 2-4 more times naturally across the body. Density 0.8-1.2% of total word count. Do not stuff.
- Use plain language. Short sentences mixed with medium. No filler clauses.

OUTPUT (via tool):
- content is a Strapi blocks array. Each block has a 'type' field. Supported types: paragraph, heading (level 2 or 3), list (ordered|unordered), quote.
- Inline nodes inside children: { type: "text", text, bold?, italic? } OR { type: "link", url, children: [{ type: "text", text }] }.
- Do NOT include H1 — the title field is the H1.
- Do NOT include code blocks or images.
- tags: 3-5 short lowercase tags relevant to the post.`;

/* ---------- Claude call ---------- */

type ToolUse = { type: "tool_use"; name: string; input: any };

async function callClaude(topic: string): Promise<any> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 8192,
      temperature: 0.6,
      system: SYSTEM_PROMPT,
      tools: [
        {
          name: "submit_blog_post",
          description: "Submit the final blog post for publication.",
          input_schema: POST_SCHEMA,
        },
      ],
      tool_choice: { type: "tool", name: "submit_blog_post" },
      messages: [
        {
          role: "user",
          content: `Write a blog post about: ${topic}\n\nReturn ONLY by calling submit_blog_post. The post must be original, specific, and concrete.`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`anthropic_${res.status}: ${errText.slice(0, 300)}`);
  }
  const json = await res.json();
  const toolBlock = (json.content as ToolUse[]).find((b) => b.type === "tool_use");
  if (!toolBlock) throw new Error("anthropic_no_tool_use");
  return toolBlock.input;
}

/* ---------- Validation (belt-and-suspenders past the JSON schema) ---------- */

function flattenText(blocks: any[]): string {
  const out: string[] = [];
  for (const b of blocks) {
    if (b.children) {
      for (const c of b.children) {
        if (c.type === "text") out.push(c.text ?? "");
        else if (c.type === "link" && c.children) {
          for (const cc of c.children) out.push(cc.text ?? "");
        } else if (c.children) {
          for (const cc of c.children) {
            if (cc.type === "text") out.push(cc.text ?? "");
          }
        }
      }
    }
  }
  return out.join(" ");
}

function validate(p: any): { ok: true } | { ok: false; reason: string } {
  if (!p || typeof p !== "object") return { ok: false, reason: "not_object" };
  for (const k of ["title", "slug", "excerpt", "content", "target_keyword", "tags"]) {
    if (!(k in p)) return { ok: false, reason: `missing_${k}` };
  }
  if (!Array.isArray(p.content) || p.content.length < 8) return { ok: false, reason: "content_too_short" };

  const text = flattenText(p.content);
  const wc = text.trim().split(/\s+/).filter(Boolean).length;
  if (wc < 1100 || wc > 2000) return { ok: false, reason: `word_count_${wc}` };

  const titleHasKeyword = new RegExp(p.target_keyword, "i").test(p.title);
  if (!titleHasKeyword) return { ok: false, reason: "keyword_missing_from_title" };

  const hasOneH2WithKeyword = p.content.some(
    (b: any) =>
      b.type === "heading" &&
      b.level === 2 &&
      new RegExp(p.target_keyword, "i").test(flattenText([b]))
  );
  if (!hasOneH2WithKeyword) return { ok: false, reason: "keyword_missing_from_any_h2" };

  if (/^#\s/m.test(text)) return { ok: false, reason: "stray_h1_in_text" };

  return { ok: true };
}

/* ---------- Strapi (auto-publish + slug collision dedupe) ---------- */

async function slugExists(slug: string): Promise<boolean> {
  const url = `${STRAPI_URL}/api/blog-posts?filters[slug][$eq]=${encodeURIComponent(
    slug
  )}&pagination[limit]=1`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
  });
  if (!res.ok) throw new Error(`strapi_check_${res.status}`);
  const json = await res.json();
  return Array.isArray(json.data) && json.data.length > 0;
}

async function uniqueSlug(base: string): Promise<string> {
  if (!(await slugExists(base))) return base;
  for (let i = 2; i < 10; i++) {
    const candidate = `${base}-${i}`.slice(0, 60);
    if (!(await slugExists(candidate))) return candidate;
  }
  return `${base.slice(0, 50)}-${Date.now().toString(36).slice(-4)}`;
}

async function postToStrapi(payload: any): Promise<{ id: number; documentId: string }> {
  const res = await fetch(`${STRAPI_URL}/api/blog-posts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${STRAPI_TOKEN}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`strapi_${res.status}: ${errText.slice(0, 300)}`);
  }
  const json = await res.json();
  return { id: json.data.id, documentId: json.data.documentId };
}

/* ---------- Handler ---------- */

export async function GET(req: Request) {
  if (CRON_SECRET) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const topic = pickTopic();

  try {
    const draft = await callClaude(topic);
    const v = validate(draft);
    if (!v.ok) {
      console.warn("[cron/publish] skip: validation failed", { topic, reason: v.reason });
      return NextResponse.json({ skipped: true, topic, reason: v.reason });
    }

    const slug = await uniqueSlug(draft.slug);

    const payload = {
      data: {
        title: draft.title,
        slug,
        excerpt: draft.excerpt,
        content: draft.content,
        author: "Edvinas Lund",
        publishedAt: new Date().toISOString(),
        seo: {
          metaTitle: draft.title,
          metaDescription: draft.excerpt,
          canonicalURL: `https://www.aboast.com/blog/${slug}`,
        },
      },
    };

    const result = await postToStrapi(payload);
    console.log("[cron/publish] published", { topic, slug, id: result.id });

    return NextResponse.json({
      ok: true,
      topic,
      slug,
      strapi_id: result.id,
      document_id: result.documentId,
      tags: draft.tags,
    });
  } catch (err: any) {
    console.error("[cron/publish] error", { topic, err: err?.message ?? String(err) });
    return NextResponse.json(
      { error: err?.message ?? String(err), topic },
      { status: 500 }
    );
  }
}
