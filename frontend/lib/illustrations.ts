import fs from "node:fs";
import path from "node:path";

/**
 * Blog illustrations, described as data in content/illustrations/<slug>.json
 * and drawn by components/illustrations with the site's own pieces (the brand
 * colours and font, white cards, star ratings). scripts/illustrations.mjs
 * photographs each one into public/blog/img/<slug>/<name>.jpg, which posts
 * embed as ordinary Markdown images. Example content only: no invented numbers.
 */

/** A review source from SOURCES in components/illustrations/illustration.tsx: google, trustpilot, yelp, tripadvisor, form, email. */
export type SourceSlug = string;
/** A name from ICONS in components/illustrations/icons.tsx. */
export type IconName = string;

export type QuoteCard = {
  /** The testimonial itself. Clearly an example, never a real customer. */
  text: string;
  /** Made-up name that fits the post's example business. */
  name: string;
  /** Role and company, e.g. "Founder, Juniper Studio". */
  role?: string;
  /** 1 to 5. Defaults to 5. */
  stars?: number;
  /** Where it came from, shown as a small badge. */
  source?: SourceSlug;
};

export type Illustration =
  | { type: "quotes"; quotes: QuoteCard[] }
  | {
      type: "email";
      from: string;
      subject: string;
      /** One string per paragraph. */
      body: string[];
      /** The collection link, drawn as a button. */
      button?: string;
    }
  | { type: "steps"; steps: { title: string; body?: string; icon?: IconName }[] }
  | {
      type: "compare";
      /** Two or three columns. A column named Aboast gets the logo; `highlight` tints it. */
      columns: { name: string; note?: string; highlight?: boolean }[];
      /** One value per column. "yes" and "no" draw a tick and a dash; anything else is text. */
      rows: { label: string; values: string[] }[];
      footnote?: string;
    }
  | { type: "checklist"; title: string; items: string[] }
  | { type: "tiles"; tiles: { title: string; body?: string; icon?: IconName }[] }
  | { type: "timeline"; phases: { when: string; title: string; body?: string; peak?: boolean }[] }
  | { type: "fanout"; source: { title: string; body?: string; icon?: IconName }; outputs: { label: string; icon?: IconName }[] }
  | { type: "bars"; unit?: string; log?: boolean; bars: { label: string; value: number; icon?: IconName }[] };

export type IllustrationSpec = Illustration & {
  name: string;
  /** Short label in the corner, e.g. "Sample email". */
  label?: string;
  /** A heading drawn into the image. Keep it short; the caption explains. */
  heading?: string;
  /** Canvas height at 1200px wide. Defaults depend on the type. */
  height?: number;
};

const DIR = path.join(process.cwd(), "content", "illustrations");

export function getIllustrations(slug: string): IllustrationSpec[] {
  const file = path.join(DIR, `${slug}.json`);
  if (!/^[a-z0-9-]+$/.test(slug) || !fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, "utf8")) as IllustrationSpec[];
}

export function getIllustration(slug: string, name: string): IllustrationSpec | undefined {
  return getIllustrations(slug).find((i) => i.name === name);
}
