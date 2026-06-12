import { Inbox, LayoutList, Megaphone } from "lucide-react";
import { CollectNetwork } from "./feature-visuals/collect-network";
import { CurateChart } from "./feature-visuals/curate-chart";
import { DisplayRadar } from "./feature-visuals/display-radar";

const CARDS = [
  {
    icon: Inbox,
    title: "Collect from any source",
    body: "Capture text and video reviews with a branded form. Or pull in the ones you already have from X, Google, Product Hunt, and 30+ other places.",
    visual: <CollectNetwork />,
  },
  {
    icon: LayoutList,
    title: "Organize at a glance",
    body: "Tag, star, and search across every review in one inbox. Pin your strongest stories to the top — every embed updates in real time.",
    visual: <CurateChart />,
  },
  {
    icon: Megaphone,
    title: "Show them off, your way",
    body: "Twelve widget styles — walls, carousels, badges, marquees, and more. One script tag and they live on any page, no engineers needed.",
    visual: <DisplayRadar />,
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="w-full max-w-6xl mx-auto mt-32 px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      {CARDS.map(({ icon: Icon, title, body, visual }) => (
        <div
          key={title}
          className="relative overflow-hidden group bg-white border border-border hover:border-neutral-300 rounded-2xl p-8 flex flex-col min-h-[420px] transition-all duration-300 shadow-[0_1px_2px_rgba(15,15,15,0.04),0_8px_24px_-12px_rgba(15,15,15,0.08)]"
        >
          {/* Inner ambient glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-primary/[0.06] blur-[50px] rounded-full pointer-events-none transition-opacity opacity-60 group-hover:opacity-100" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary-soft border border-primary/20 flex items-center justify-center text-primary">
                <Icon className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
            </div>
            <p className="text-base text-muted-foreground leading-relaxed">{body}</p>
          </div>

          <div className="flex-1 mt-8 relative z-10">{visual}</div>
        </div>
      ))}
    </section>
  );
}
