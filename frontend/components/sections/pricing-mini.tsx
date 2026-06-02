import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const SAAS_URL = process.env.NEXT_PUBLIC_SAAS_URL ?? "https://app.aboast.com";

const TIERS = [
  {
    name: "Free",
    price: "$0",
    suffix: "forever",
    description: "For founders shipping their first wall of love.",
    features: ["Up to 20 testimonials", "1 collection page", "All widget styles", "Aboast watermark"],
    cta: "Start free",
    href: `${SAAS_URL}/sign-up`,
    featured: false,
  },
  {
    name: "Pro",
    price: "$19",
    suffix: "/ month",
    description: "For teams growing through social proof.",
    features: ["Unlimited testimonials", "Unlimited collection pages", "Remove watermark", "Video testimonials", "Custom branding"],
    cta: "Start 14-day trial",
    href: `${SAAS_URL}/sign-up?plan=pro`,
    featured: true,
  },
  {
    name: "Business",
    price: "$49",
    suffix: "/ month",
    description: "For teams shipping social proof at scale.",
    features: ["Everything in Pro", "5 team seats", "API access", "Priority support", "SSO + audit log"],
    cta: "Start trial",
    href: `${SAAS_URL}/sign-up?plan=business`,
    featured: false,
  },
];

export function PricingMini() {
  return (
    <section id="pricing" className="w-full max-w-6xl mx-auto mt-32 px-6">
      <div className="flex flex-col items-center mb-16 text-center">
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-foreground mb-6">
          Pricing that{" "}
          <span className="font-serif italic text-primary">scales</span> with you.
        </h2>
        <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
          Start free. Upgrade when your wall of love starts paying for itself.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            className={cn(
              "relative rounded-3xl p-8 flex flex-col transition-all",
              tier.featured
                ? "bg-foreground text-white border border-foreground shadow-[0_24px_48px_-24px_rgba(15,15,15,0.30)]"
                : "bg-white border border-border shadow-[0_1px_2px_rgba(15,15,15,0.04),0_8px_24px_-12px_rgba(15,15,15,0.08)]"
            )}
          >
            {tier.featured && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-medium px-3 py-1 rounded-full bg-primary text-white">
                Most popular
              </span>
            )}

            <h3 className={cn("text-xl font-semibold tracking-tight mb-2", tier.featured ? "text-white" : "text-foreground")}>
              {tier.name}
            </h3>
            <p className={cn("text-sm leading-relaxed mb-6", tier.featured ? "text-white/60" : "text-muted-foreground")}>
              {tier.description}
            </p>

            <div className="flex items-baseline gap-1.5 mb-8">
              <span className={cn("text-4xl font-semibold tracking-tight", tier.featured ? "text-white" : "text-foreground")}>
                {tier.price}
              </span>
              <span className={cn("text-sm", tier.featured ? "text-white/60" : "text-muted-foreground")}>{tier.suffix}</span>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {tier.features.map((f) => (
                <li key={f} className={cn("flex items-start gap-2.5 text-[15px]", tier.featured ? "text-white/85" : "text-foreground/85")}>
                  <Check className="w-4 h-4 mt-1 text-primary shrink-0" strokeWidth={2.5} />
                  {f}
                </li>
              ))}
            </ul>

            <a
              href={tier.href}
              className={cn(
                "inline-flex items-center justify-center w-full py-3 rounded-full text-[15px] font-medium transition-all",
                tier.featured
                  ? "bg-primary hover:bg-primary-hover text-white shadow-[0_4px_24px_-6px_rgba(255,89,94,0.50)] hover:shadow-[0_6px_32px_-4px_rgba(255,89,94,0.65)]"
                  : "bg-foreground text-white hover:bg-foreground/90"
              )}
            >
              {tier.cta}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
