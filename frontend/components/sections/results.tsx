import { ProofDots } from "./feature-visuals/proof-dots";
import { LiftBars } from "./feature-visuals/lift-bars";
import { CurateChart } from "./feature-visuals/curate-chart";

type Stat = {
  stat: string;
  label: string;
  sub: string;
  visual: React.ReactNode;
};

const STATS: Stat[] = [
  {
    stat: "92%",
    label: "Read reviews before they buy.",
    sub: "Reviews aren't a nice-to-have. They're the first checkpoint in your funnel.",
    visual: <ProofDots />,
  },
  {
    stat: "+34%",
    label: "Average conversion lift.",
    sub: "On-page proof is one of the highest-ROI tweaks a growth team can ship.",
    visual: <LiftBars />,
  },
  {
    stat: "2.7×",
    label: "More signups, above the fold.",
    sub: "A wall of love near the CTA is the single fastest lever for sign-up rate.",
    visual: <CurateChart tooltip="2.7×" />,
  },
];

export function Results() {
  return (
    <section className="w-full max-w-6xl mx-auto mt-32 px-6">
      <div className="text-center mb-16 max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-foreground mb-6">
          Proof that{" "}
          <span className="font-serif italic text-primary">converts</span>.
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Buyers check reviews before they buy. A wall of love on the right page is the fastest growth lever most teams haven&apos;t pulled yet.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STATS.map(({ stat, label, sub, visual }) => (
          <div
            key={stat}
            className="relative overflow-hidden group bg-white border border-border hover:border-neutral-300 rounded-2xl p-8 flex flex-col transition-all duration-300 shadow-[0_1px_2px_rgba(15,15,15,0.04),0_8px_24px_-12px_rgba(15,15,15,0.08)]"
          >
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-primary/[0.06] blur-[50px] rounded-full pointer-events-none transition-opacity opacity-60 group-hover:opacity-100" />

            <div className="relative z-10 mb-6 flex items-center justify-center min-h-[140px]">
              {visual}
            </div>

            <div className="relative z-10 text-center mt-auto">
              <div className="text-5xl md:text-6xl font-semibold tracking-tight text-primary leading-none mb-3">
                {stat}
              </div>
              <h3 className="text-base font-semibold tracking-tight text-foreground mb-2">
                {label}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
