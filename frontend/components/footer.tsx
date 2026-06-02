import Image from "next/image";
import Link from "next/link";
import { XIcon, LinkedInIcon, GithubIcon } from "@/components/social-icons";

const COLS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Widgets", href: "/#features" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Embed docs", href: "#" },
      { label: "Changelog", href: "#" },
      { label: "Help center", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Customers", href: "#" },
      { label: "Careers", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "DPA", href: "#" },
      { label: "Security", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="w-full mt-32 border-t border-border">
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <Image src="/logo-color.svg" alt="aboast" width={24} height={24} />
              <span className="font-semibold tracking-tight text-[15px] text-foreground">aboast</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">
              Collect, curate, and embed testimonials anywhere.
            </p>
          </div>

          {COLS.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-4">
                {col.title}
              </p>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-foreground/70 hover:text-foreground transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-border flex items-center justify-between flex-wrap gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Aboast. Built for product teams.
          </p>
          <div className="flex items-center gap-2">
            <a href="#" aria-label="X" className="w-9 h-9 rounded-full grid place-items-center text-muted-foreground hover:text-foreground hover:bg-neutral-100 transition-colors">
              <XIcon className="w-3.5 h-3.5" />
            </a>
            <a href="#" aria-label="LinkedIn" className="w-9 h-9 rounded-full grid place-items-center text-muted-foreground hover:text-foreground hover:bg-neutral-100 transition-colors">
              <LinkedInIcon className="w-4 h-4" />
            </a>
            <a href="#" aria-label="GitHub" className="w-9 h-9 rounded-full grid place-items-center text-muted-foreground hover:text-foreground hover:bg-neutral-100 transition-colors">
              <GithubIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}


