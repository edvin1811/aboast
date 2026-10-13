/** URLs and facts shared by every page. Anything the copy states about plans
 *  or the app should come from here, so it can't drift page by page. */

/** www is the host that serves the site (aboast.com redirects to it), so it's
 *  the one canonicals, the sitemap and JSON-LD point at. */
export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://www.aboast.com")
  .replace(/\/$/, "")
  // The Vercel project has NEXT_PUBLIC_APP_URL=https://aboast.com, which only
  // redirects to www; canonicals must name the host that actually serves.
  .replace(/^https:\/\/aboast\.com$/, "https://www.aboast.com");
export const APP_URL = process.env.NEXT_PUBLIC_SAAS_URL ?? "https://app.aboast.com";

export const SIGN_UP_URL = `${APP_URL}/sign-up`;
export const SIGN_IN_URL = `${APP_URL}/sign-in`;

/** Mirrors PLAN_LIMITS / PRO_PRICE_USD in the app (app/lib/plans.ts). */
export const PLANS = [
  {
    name: "Free",
    price: "$0",
    suffix: "forever",
    description: "For founders shipping their first wall of love.",
    features: [
      "1 workspace",
      "3 forms, 3 widgets, 3 walls",
      "10 testimonials per workspace",
      "All widget styles",
      '"Powered by aboast" watermark',
    ],
  },
  {
    name: "Pro",
    price: "$19",
    suffix: "/ month",
    description: "For SaaS founders shipping social proof on every page.",
    features: [
      "3 workspaces",
      "Unlimited forms, widgets, and walls",
      "Unlimited testimonials",
      "No watermark anywhere",
      "Video testimonials, CSV export, custom domains",
    ],
  },
] as const;

/** Review sites the app imports from (app/api/import/*). */
export const IMPORT_SOURCES = ["Google", "Trustpilot", "Yelp", "Tripadvisor"] as const;

/** Widget layouts in the app (components/widgets/*). */
export const WIDGET_STYLES = ["grid", "masonry", "carousel", "list", "marquee", "featured quote", "badge", "slider with thumbnails"] as const;
