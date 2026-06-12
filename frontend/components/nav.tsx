"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const SAAS_URL = process.env.NEXT_PUBLIC_SAAS_URL ?? "https://app.aboast.com";

const LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return pathname === "/";
    return pathname === href || pathname?.startsWith(href + "/");
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-6 px-4 sticky top-4 z-50">
      <nav className="flex items-center justify-between bg-white/75 backdrop-blur-md border border-border rounded-full pl-5 pr-4 py-4 shadow-[0_1px_2px_rgba(15,15,15,0.04),0_12px_32px_-18px_rgba(15,15,15,0.12)]">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Image src="/logo-color.svg" alt="aboast" width={24} height={24} />
          <span className="font-semibold tracking-tight text-[15px] text-foreground">aboast</span>
        </Link>

        <div className="hidden md:flex items-center gap-7">
          {LINKS.map(({ href, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={label}
                href={href}
                className={cn(
                  "text-[14px] transition-colors",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`${SAAS_URL}/sign-in`}
            className="hidden sm:inline text-[14px] text-muted-foreground hover:text-foreground px-3 py-2 transition-colors"
          >
            Log in
          </a>
          <a
            href={`${SAAS_URL}/sign-up`}
            className="hidden sm:inline-flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-[14px] font-medium px-4 py-2 rounded-full transition-all shadow-[0_4px_16px_-4px_rgba(255,89,94,0.45)] hover:shadow-[0_6px_20px_-4px_rgba(255,89,94,0.55)]"
          >
            Get started
            <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
          </a>
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden w-10 h-10 grid place-items-center text-foreground rounded-full hover:bg-neutral-100"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="w-5 h-5" strokeWidth={1.75} /> : <Menu className="w-5 h-5" strokeWidth={1.75} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="md:hidden mt-3 bg-white/95 backdrop-blur-md border border-border rounded-2xl p-3 shadow-[0_12px_32px_-18px_rgba(15,15,15,0.16)]">
          <div className="flex flex-col">
            {LINKS.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                onClick={() => setOpen(false)}
                className="px-4 py-3 text-[15px] text-foreground hover:bg-neutral-100 rounded-2xl"
              >
                {label}
              </Link>
            ))}
            <div className="border-t border-border mt-2 pt-2 flex flex-col gap-2 px-1 pb-1">
              <a
                href={`${SAAS_URL}/sign-in`}
                className="px-4 py-3 text-[15px] text-foreground hover:bg-neutral-100 rounded-2xl"
              >
                Log in
              </a>
              <a
                href={`${SAAS_URL}/sign-up`}
                className="inline-flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-[14px] font-medium px-4 py-3 rounded-full transition-all"
              >
                Get started
                <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
