import type { NextConfig } from "next";

// Per-route framing rules:
//   - Public embed surfaces (/widget, /wall, /submit) must be iframeable
//     from any customer site, so we set `frame-ancestors *`.
//   - Dashboard, auth, and authed API routes MUST NOT be iframeable to
//     prevent clickjacking — `frame-ancestors 'none'` plus
//     `X-Frame-Options: DENY` for old browsers.
//
// Next.js `headers()` combines all matching rules and a single response
// can pick up multiple `Content-Security-Policy` headers (browsers
// intersect them and the most restrictive wins). So rules are split into
// non-overlapping sources rather than a catch-all + overrides.

const BASELINE = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

const EMBEDDABLE = [
  ...BASELINE,
  { key: "Content-Security-Policy", value: "frame-ancestors *;" },
];

const LOCKED = [
  ...BASELINE,
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none';" },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  async headers() {
    return [
      // Public embed surfaces — iframeable from anywhere.
      { source: "/widget/:path*", headers: EMBEDDABLE },
      { source: "/wall/:path*", headers: EMBEDDABLE },
      { source: "/submit/:path*", headers: EMBEDDABLE },

      // Authenticated surfaces — block framing.
      { source: "/", headers: LOCKED },
      { source: "/dashboard/:path*", headers: LOCKED },
      { source: "/sign-in/:path*", headers: LOCKED },
      { source: "/sign-up/:path*", headers: LOCKED },
      { source: "/api/:path*", headers: LOCKED },
    ];
  },
};

export default nextConfig;
