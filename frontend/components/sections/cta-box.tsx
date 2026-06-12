import { ArrowRight, Sparkles } from "lucide-react";

const SAAS_URL = process.env.NEXT_PUBLIC_SAAS_URL ?? "https://app.aboast.com";

export function CTABox() {
  return (
    <section className="w-full max-w-4xl mx-auto mt-32 px-6 relative">
      <div className="absolute inset-0 bg-primary/[0.08] blur-[100px] rounded-full pointer-events-none" />
      <div className="relative z-10 bg-white border border-border rounded-2xl p-12 md:p-20 flex flex-col items-center text-center overflow-hidden shadow-[0_1px_2px_rgba(15,15,15,0.04),0_24px_48px_-24px_rgba(15,15,15,0.16)]">
        <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <h2 className="text-4xl md:text-6xl font-semibold tracking-tight text-foreground mb-6 leading-[1.1]">
          Ready to ship{" "}
          <span className="font-serif italic text-primary">social proof?</span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
          Set up your first form, embed your first widget, and watch your conversion rate move — all on the free plan, no credit card.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <a
            href={`${SAAS_URL}/sign-up`}
            className="group w-full sm:w-auto bg-primary hover:bg-primary-hover text-white font-medium text-base px-8 py-3.5 rounded-full transition-all flex items-center justify-center gap-2 shadow-[0_4px_28px_-6px_rgba(255,89,94,0.50)] hover:shadow-[0_6px_36px_-4px_rgba(255,89,94,0.65)] whitespace-nowrap"
          >
            Start free
            <ArrowRight className="w-[18px] h-[18px] transition-transform group-hover:translate-x-1" strokeWidth={1.75} />
          </a>
          <a
            href="#features"
            className="w-full sm:w-auto text-foreground hover:text-foreground font-medium text-base px-8 py-3.5 rounded-full transition-all border border-border hover:border-neutral-300 bg-white hover:bg-neutral-50 whitespace-nowrap"
          >
            How it works
          </a>
        </div>
      </div>
    </section>
  );
}
