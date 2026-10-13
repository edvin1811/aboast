import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The blog cron reads content/blog at runtime to pick an unused topic,
  // link to existing posts and avoid slug clashes, so the files must ship
  // with that function. Pages read them at build time and need nothing extra.
  outputFileTracingIncludes: {
    "/api/cron/publish": ["./content/blog/**/*"],
  },
};

export default nextConfig;
