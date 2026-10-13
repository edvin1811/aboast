import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // /api/og must stay crawlable: it's every post's social card and article
  // image, and X won't show a card whose image robots.txt blocks.
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/cron/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
