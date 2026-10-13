import type { Metadata } from "next";

/** Advertises the blog feed. A page that sets its own `alternates` replaces
 *  the layout's, so pages put RSS back in next to their canonical. */
export const RSS = { "application/rss+xml": [{ url: "/blog/rss.xml", title: "Aboast Blog" }] };

/** Site-relative social image from /api/og; metadataBase in the root layout
 *  makes it absolute. */
export function ogImage(title: string, tag = "ABOAST"): string {
  return `/api/og?${new URLSearchParams({ title, tag }).toString()}`;
}

/**
 * Title, description, canonical and social tags for one page. Open Graph and
 * Twitter are set explicitly because they don't inherit a page's own title —
 * without this every page would share the homepage's social card text.
 */
export function pageMetadata({
  title,
  description,
  path,
  tag,
  absoluteTitle,
}: {
  title: string;
  description: string;
  path: string;
  tag?: string;
  /** Skip the "| Aboast" suffix. */
  absoluteTitle?: boolean;
}): Metadata {
  const image = ogImage(title, tag);
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path, types: RSS },
    openGraph: { type: "website", siteName: "Aboast", title, description, url: path, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}
