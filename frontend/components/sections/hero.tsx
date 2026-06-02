import { ArrowRight, ChevronRight, CheckCircle2 } from "lucide-react";

const SAAS_URL = process.env.NEXT_PUBLIC_SAAS_URL ?? "https://app.aboast.com";

export function Hero() {
  return (
    <main className="w-full max-w-4xl mx-auto mt-16 px-6 flex flex-col items-center text-center">
      

      {/* Headline */}
      <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-foreground leading-[1.05] mb-6">
        Turn customer love
        <br />
        into your{" "}
        <span className="font-serif italic text-primary pr-1">best</span> sales tool.
      </h1>

      {/* Subheadline */}
      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
        Gather reviews with a branded form or pull them in from 30+ sources,
        <br className="hidden sm:block" />
        keep them organized in one place, and show them off in beautiful widgets — without writing code.
      </p>

      {/* CTA */}
      <a
        href={`${SAAS_URL}/sign-up`}
        className="group bg-primary hover:bg-primary-hover text-white font-medium text-base px-8 py-3.5 rounded-full transition-all inline-flex items-center gap-2 shadow-[0_4px_28px_-6px_rgba(255,89,94,0.50)] hover:shadow-[0_6px_36px_-4px_rgba(255,89,94,0.65)]"
      >
        Start free
        <ArrowRight className="w-[18px] h-[18px] transition-transform group-hover:translate-x-1" strokeWidth={1.75} />
      </a>

      {/* Trust row */}
      <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 mt-8">
        {["No credit card", "Free forever plan", "2,400+ teams"].map((t) => (
          <div key={t} className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-muted-foreground/60" strokeWidth={1.75} />
            {t}
          </div>
        ))}
      </div>
    </main>
  );
}
