import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "aboast — Testimonials Management Platform",
  description: "Gather, manage, and display testimonials with beautiful widgets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#ff595e",
          colorBackground: "#fafaf7",
          colorText: "#0a0a0a",
          colorInputBackground: "#ffffff",
          colorInputText: "#0a0a0a",
          colorTextSecondary: "#6b6b6b",
          borderRadius: "0.75rem",
          fontFamily: "var(--font-sans)",
        },
        elements: {
          formButtonPrimary:
            "rounded-full shadow-[0_4px_24px_-6px_rgba(255,89,94,0.45)] hover:shadow-[0_6px_28px_-4px_rgba(255,89,94,0.55)]",
          card: "rounded-2xl border border-border shadow-[0_1px_2px_rgba(15,15,15,0.04),0_24px_48px_-24px_rgba(15,15,15,0.16)]",
          footerActionLink: "text-primary hover:text-primary-hover",
          formFieldInput: "rounded-xl border-border",
        },
      }}
    >
      <html lang="en" className={`${jakarta.variable} ${fraunces.variable}`}>
        <body className="font-sans antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
