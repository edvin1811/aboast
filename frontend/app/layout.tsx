import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/site";
import { ogImage, RSS } from "@/lib/seo";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans-family",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-serif-family",
  display: "swap",
  axes: ["SOFT"],
});

const DESCRIPTION = "Collect testimonials with a simple form, import reviews from Google and Trustpilot, and embed them on your site with beautiful widgets.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Aboast — Collect and display testimonials", template: "%s | Aboast" },
  description: DESCRIPTION,
  alternates: { types: RSS },
  openGraph: { type: "website", siteName: "Aboast", title: "Aboast — Collect and display testimonials", description: DESCRIPTION, url: "/", images: [ogImage("Turn customer love into your best sales tool")] },
  twitter: { card: "summary_large_image", title: "Aboast — Collect and display testimonials", description: DESCRIPTION, images: [ogImage("Turn customer love into your best sales tool")] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${fraunces.variable}`}>
      <body>
        <div className="page-wash" aria-hidden="true" />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
