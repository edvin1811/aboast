import { wordCount, type BlogPost } from "@/lib/blog";
import { IMPORT_SOURCES, PLANS, WIDGET_STYLES } from "@/lib/site";

/** What the on-demand blog writer (app/api/cron/publish) asks Claude for, and
 *  how it checks the answer. Kept out of the route file so it can be tested. */

/**
 * Topics, in the order the writer takes them. Each post records its topic in
 * front matter, and the writer takes the first topic no post has used yet. When
 * every topic is used it stops rather than writing near-duplicates of old
 * posts: add more here to keep it going. Most are written for one specific
 * reader, because a post for "businesses" in general helps nobody much.
 */
export const TOPICS: string[] = [
  // Written (kept so the list is the full record)
  "How to ask for a testimonial without it feeling awkward",
  "Testimonial questions to ask customers that get specific answers",
  "Where to put testimonials on a landing page",
  "What a wall of love is and how to build one",
  "How to embed Google reviews on a website",
  "Video testimonials vs text testimonials: when to use each",

  // Next up: buyer-intent guides first, then playbooks for specific readers
  "How to embed Trustpilot reviews on your website",
  "How to get testimonials when you have no customers yet",
  "Testimonial permission and consent: how to get it and keep a record",
  "How to write a testimonial request for B2B customers",
  "How to turn Slack messages and support replies into testimonials",
  "How many testimonials you need on a landing page",
  "How to edit a customer testimonial without changing what they said",
  "Testimonial page examples: how to lay out a page of customer quotes",
  "How to add testimonials to a Webflow site",
  "How to add testimonials to a WordPress site",
  "How to add testimonials to a Framer site",
  "How to use testimonials in cold emails without sounding salesy",
  "How to show customer reviews on Shopify product pages",
  "How to get more Google reviews for a local business",
  "How to respond to a negative review in public",
  "Social proof for SaaS: the kinds that work and where each one goes",
  "How agencies can collect testimonials for every client project",
  "How coaches and consultants can collect testimonials after each program",
  "How online course creators can collect student testimonials",
  "How restaurants and cafés can show their best reviews on their website",
  "How salons and spas can turn happy clients into reviews and testimonials",
  "How freelancers can build a portfolio page with client testimonials",
  "How dentists and clinics can share patient reviews while respecting privacy",
  "How real estate agents can collect and show client testimonials",
  "How home service businesses can show reviews on their quote page",
  "How to use testimonials on social media posts",
  "How to use customer quotes in onboarding emails",
  "How to A/B test testimonials on a landing page",
  "Fake reviews and testimonials: the rules and how to stay on the right side of them",
];

/** The first topic no post has used, or null when they're all taken. */
export function pickTopic(posts: BlogPost[]): string | null {
  const used = new Set(posts.map((p) => p.topic).filter(Boolean));
  return TOPICS.find((t) => !used.has(t)) ?? null;
}

/* ---------- Prompt ---------- */

const [FREE, PRO] = PLANS;

/** What Aboast really does, for the prompt. Posts may only claim these.
 *  Mirrors the app (app/lib/plans.ts, app/api/import/*, components/widgets/*). */
const ABOAST_FACTS = `- Collection forms: each form has a shareable link (and an embed code). The customer answers your questions, gives a star rating and their name; no account or login needed. You write each field's label and placeholder. Fields are short text, long text or a star rating. Each form has its own thank-you message, can auto-apply tags, and can either auto-publish submissions or hold them for approval.
- Testimonials can also be added by hand (for praise from emails, Slack, calls or social posts).
- Import reviews from ${IMPORT_SOURCES.join(", ")} by searching for the business. Google's API returns only a handful of reviews per business, chosen by Google, so imports are a selection, not a full history.
- One testimonial inbox per workspace: publish/unpublish, favorite, tag, star ratings, author name, title and company.
- Widgets embedded with one snippet (an auto-resizing script) or a plain iframe, in these layouts: ${WIDGET_STYLES.join(", ")}. Changing which testimonials a widget shows updates it on the site without a redeploy.
- Wall of Love: a hosted page with a share link (also embeddable) showing published testimonials in a masonry, grid or list layout, with options for star ratings, dates and company names.
- Plans: ${FREE.name} ${FREE.price} (${FREE.features.join("; ")}). ${PRO.name} ${PRO.price}/month (${PRO.features.join("; ")}).
- NOT in Aboast: sending emails or automated requests (customers' own email tools send the link); integrations with CRMs, Stripe or Zapier; review schema / structured data output; AI writing; NPS surveys; team seats.`;

/** Niche facts the writer may state as facts. Anything else must be phrased
 *  as advice or a hedge, never as a number. */
const NICHE_FACTS = `- Google review rich results (stars in search): markup must describe reviews visible on the page; ratings must be collected directly from users, not copied from other sites; self-serving reviews are not eligible on LocalBusiness or Organization markup. Eligible item types include Product, SoftwareApplication, Book, Course, Recipe, Event and Movie. Valid markup does not guarantee stars. Tools: Rich Results Test, Schema.org validator, Search Console's Review snippets report.
- Google offers no official widget for showing Google reviews on your own site. The Places API returns only a few reviews per place (five at the time of writing).
- US: the FTC's rules ban fake reviews and testimonials and rewards conditioned on positive sentiment; incentives and other material connections should be disclosed. EU: businesses that show consumer reviews must say whether and how they check that reviews come from real customers. Always tell readers to check the rules where they sell.
- Names, photos and quotes of customers are personal data in many places (for example under GDPR): get permission and keep a record.`;

export const SYSTEM_PROMPT = `You write the blog at aboast.com, a tool for collecting customer testimonials and showing them on a website. Posts are published under the founder, Edvin Åslund.

THE JOB: write the most useful article on the internet for one specific reader. Every topic names or implies a reader, for example a SaaS founder, a coach, a salon owner, an agency. Write for their actual situation: what they have, what goes wrong, what to do this week. A reader should be able to act on the post the same day.

WHAT MAKES A POST USEFUL (all required):
- At least one worked example specific to the reader: a request email written out, a set of questions, a page layout, or a before/after testimonial.
- At least one table or checklist they could copy.
- Concrete steps, in order, where the topic is a process.
- Honest trade-offs and pitfalls, including legal or etiquette rules that genuinely apply (permission, disclosure, fake reviews), stated carefully ("check the rules where you sell").

TRUTH RULES (a post that breaks these is rejected):
- NEVER invent numbers: no statistics, percentages, conversion lifts, survey results, "studies show", response rates or Aboast usage data. The only numbers you may state as fact are in NICHE FACTS and ABOAST FACTS below, plus plain arithmetic and clearly hypothetical examples ("say you email 20 customers").
- NEVER invent experience or sources: no "we've seen", "from our data", "customers tell us", "I've watched", "our users", customer stories, quotes from named people, or real companies' testimonials. Example testimonials must be clearly illustrative and unattributed.
- Only describe Aboast using ABOAST FACTS. Never imply a feature that isn't listed there.
- If you're unsure a platform or legal detail is still current, leave it out or tell the reader to check.

NICHE FACTS:
${NICHE_FACTS}

ABOAST FACTS:
${ABOAST_FACTS}

VOICE: plain, warm, specific. Second person ("you"). Short paragraphs of 2–4 sentences. Like a smart friend who has done this before, not a marketer. No hype.

Use the submit_blog_post tool. Output ONLY by calling that tool.

CONTENT RULES:
- Length: 1,100–1,600 words.
- Structure: a 1–2 paragraph opening that names the reader's problem in their words. Then 5–7 H2 sections. End with a short wrap-up.
- Title: 40–65 characters, plain and literal, target keyword near the start, one idea. No "X: Y" framing, no vague framing ("the anatomy of…", "the real cost of…").
- Excerpt: 140–160 characters, says what the reader will get.
- Slug: lowercase-kebab-case, target keyword first, max 60 characters.
- Internal links: 2–4 Markdown links using ONLY paths from the INTERNAL LINKS list, exactly as written.
- Banned words: "leverage", "unlock", "harness", "elevate", "supercharge", "ultimate guide", "in today's fast-paced world", "game-changer", "in this article", "delve".

FORMATTING:
- No emoji in headings or the title. Emoji only inside example messages, where they'd really appear.
- Bold at most one phrase per section, for the key point. Don't bold whole sentences.
- 2–3 lists and at least one table.
- No filler ("It's important to note that…", "At the end of the day…", "When it comes to…").

ABOAST IN THE POST:
- Mention Aboast 1–3 times where it genuinely helps the reader (usually the collecting or displaying step), as "a tool like aboast" the first time. One short section or step describing that workflow is enough. Write the brand in lowercase ("aboast") as the site does.
- The post must be useful to someone who never uses Aboast.

SEO:
- target_keyword: 2–5 words, the phrase this reader would type.
- Use it in the title, the first paragraph, one H2, and naturally 2–4 more times. Don't stuff.

OUTPUT (via the submit_blog_post tool):
- content_markdown: the post body in Markdown. "## " for H2, "### " for H3, blank lines between paragraphs, "- " or "1. " lists, "> " for an example message (one "> " line per paragraph, with "> " blank lines between), **bold**, *italic*, [text](/path) links, and GFM tables.
- Do NOT include an H1 ("# "). No images, no HTML. A code block only when the topic is code (for example JSON-LD).
- tags: 3–5 short lowercase tags.`;

export const POST_SCHEMA = {
  type: "object",
  required: ["title", "slug", "excerpt", "content_markdown", "target_keyword", "tags"],
  additionalProperties: false,
  properties: {
    title: { type: "string", minLength: 20, maxLength: 70 },
    slug: { type: "string", pattern: "^[a-z0-9-]+$", maxLength: 60 },
    excerpt: { type: "string", minLength: 140, maxLength: 165 },
    target_keyword: { type: "string" },
    tags: { type: "array", minItems: 3, maxItems: 5, items: { type: "string" } },
    content_markdown: { type: "string", minLength: 3000 },
  },
};

export type Draft = {
  title: string;
  slug: string;
  excerpt: string;
  content_markdown: string;
  target_keyword: string;
  tags: string[];
};

/** Every internal page a post may link to. */
export function internalLinks(posts: BlogPost[]): { paths: Set<string>; list: string } {
  const entries: [string, string][] = [
    ["/", "aboast homepage (product overview)"],
    ["/#pricing", "plans"],
    ["/blog", "all posts"],
    ...posts.slice(0, 60).map((p) => [`/blog/${p.slug}`, p.title] as [string, string]),
  ];
  return { paths: new Set(entries.map(([path]) => path)), list: entries.map(([path, label]) => `- ${path} — ${label}`).join("\n") };
}

/* ---------- Validation ---------- */

// Telltale signs the model gave up and submitted scaffolding instead of a
// real post.
const GARBAGE_PATTERNS = /\bplaceholder\b|\blorem ipsum\b|\btodo\b|\btbd\b|\[insert\b|\(removed\)|\bxxx+\b/i;

// The Strapi-era posts were full of these: invented first-party data ("from
// what we've seen at aboast, 50–65% response rates…") and unsourced studies.
// The prompt forbids them; this catches the ones that slip through.
const FABRICATION_PATTERNS =
  /\bfrom what we've seen\b|\b(?:we've|we have|i've|i have) (?:seen|noticed|found|watched)\b|\bour (?:internal )?(?:data|numbers|users|customers)\b|\b(?:founders|customers|users|clients|people) (?:tell|told) us\b|\b(?:studies|research|data) (?:show|shows|suggest|suggests|found)\b|\baccording to (?:a|one|recent) (?:study|survey|report)\b/i;
const PERCENT = /\b\d+(?:\.\d+)?\s?%/;

const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]\u{FE0F}?\s*/gu;

/** Headings carry no emoji and no bold, whatever the model did. */
export function tidyMarkdown(markdown: string): string {
  return markdown.replace(/^(#{2,6} )(.*)$/gm, (_, hashes: string, text: string) => hashes + text.replace(EMOJI, "").replace(/\*\*/g, "").trim());
}

/** Links to anything outside the allowed list lose their link and keep their
 *  text — the model sometimes invents a plausible blog URL, and a dead
 *  internal link is worse than no link. */
export function stripUnknownLinks(markdown: string, allowed: Set<string>): { markdown: string; removed: string[] } {
  const removed: string[] = [];
  const out = markdown.replace(/(!?)\[([^\]]+)\]\(([^)\s]+)\)/g, (whole, bang, text, href) => {
    if (bang) return whole;
    const path = href.replace(/^https?:\/\/(www\.)?aboast\.com/, "").replace(/\?.*$/, "").replace(/(.)\/$/, "$1") || "/";
    if (allowed.has(path)) return `[${text}](${path})`;
    removed.push(href);
    return text;
  });
  return { markdown: out, removed };
}

export function validate(p: Draft): { ok: true; wc: number } | { ok: false; reason: string } {
  if (!p || typeof p !== "object") return { ok: false, reason: "not_object" };
  for (const k of ["title", "slug", "excerpt", "content_markdown", "target_keyword", "tags"] as const) {
    if (!(k in p)) return { ok: false, reason: `missing_${k}` };
  }
  if (typeof p.title !== "string" || p.title.length < 20) return { ok: false, reason: "title_too_short" };
  const md = p.content_markdown ?? "";
  if ([p.title, p.slug, p.excerpt, md].some((s) => GARBAGE_PATTERNS.test(s))) return { ok: false, reason: "garbage_output" };
  const invented = [p.excerpt, md].join("\n").match(FABRICATION_PATTERNS);
  if (invented) return { ok: false, reason: `fabricated_claim: ${invented[0]}` };
  const percent = [p.title, p.excerpt, md].join("\n").match(PERCENT);
  if (percent) return { ok: false, reason: `made_up_number: ${percent[0]}` };
  if (/^# /m.test(md)) return { ok: false, reason: "has_h1" };
  if (/<\/?[a-z][a-z0-9]*[\s>/]/i.test(md.replace(/```[\s\S]*?```/g, "").replace(/`[^`]*`/g, ""))) return { ok: false, reason: "has_html" };
  const h2s = md.match(/^## .+$/gm) ?? [];
  if (h2s.length < 4) return { ok: false, reason: "content_too_short" };
  if (!/^\|.*\|\s*$/m.test(md)) return { ok: false, reason: "no_table" };

  // Every meaningful keyword word (4+ letters) must be in the title,
  // prefix-matched so plurals pass.
  const keywordWords = p.target_keyword.toLowerCase().split(/\s+/).filter((w) => w.length >= 4);
  const missing = keywordWords.filter((w) => !new RegExp(`\\b${w.replace(/[^a-z0-9]/g, "")}`, "i").test(p.title));
  if (missing.length > 0) return { ok: false, reason: `keyword_missing_from_title: ${missing.join(",")}` };

  // Word count is logged, not enforced: rejecting a 1,050-word post just burns a call.
  return { ok: true, wc: wordCount(md) };
}

export function buildRetryHint(reason: string): string {
  if (reason.startsWith("keyword_missing_from_title")) return "Your previous attempt didn't include the target keyword in the title. Make sure every word of target_keyword (4+ letters) appears in the title this time.";
  if (reason === "content_too_short") return "Your previous attempt was too thin. Write the full post with 5-7 H2 sections (\"## \").";
  if (reason.startsWith("fabricated_claim")) return `Your previous attempt claimed experience or data that doesn't exist (${reason.slice(18)}). Remove every "we've seen", "our data", "customers tell us" and "studies show". Give advice and worked examples instead.`;
  if (reason.startsWith("made_up_number")) return "Your previous attempt contained a percentage. Remove every percentage: none of them can be sourced. Use the facts in the prompt, worked examples or plain advice instead.";
  if (reason === "no_table") return "Your previous attempt had no table. Include at least one GFM table the reader can copy, like a checklist, a comparison or a plan.";
  if (reason === "title_too_short" || reason === "garbage_output") return "Your previous attempt submitted placeholder content instead of a finished post. Write the entire post for real: a specific title, excerpt and full body, with no TODOs or placeholders.";
  if (reason === "has_h1") return "Your previous attempt had an H1 (\"# \") in content_markdown. Start sections with \"## \"; the title is the only H1.";
  if (reason === "has_html") return "Your previous attempt contained HTML tags. Use plain Markdown only; put any HTML you need to show inside backticks.";
  if (reason === "no_tool_call") return "Your previous attempt answered in text. Submit the post by calling the submit_blog_post tool.";
  if (reason.startsWith("incomplete_generation_")) return "Your previous attempt was cut off before finishing. Write a tighter version, near 1200 words, so the full submit_blog_post call completes.";
  return `Your previous attempt failed validation (${reason}). Fix that specific issue this time.`;
}
