import { MessageSquareHeart, Tags, Share2, GalleryVerticalEnd } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    icon: MessageSquareHeart,
    title: "1. Collect",
    body: "Set up a branded form, or pull in reviews you already have from 30+ platforms.",
    highlight: false,
  },
  {
    icon: GalleryVerticalEnd,
    title: "2. Manage",
    body: "Tag, star, and pin in one inbox. Your strongest stories rise to the top of every widget.",
    highlight: true,
  },
  {
    icon: Share2,
    title: "3. Share",
    body: "Paste one script tag on any page. Your widgets sync everywhere, with zero engineering work.",
    highlight: false,
  },
];

export function Process() {
  return (
    <section id="how-it-works" className="w-full max-w-6xl mx-auto mt-32 px-6 flex flex-col items-center text-center">
      <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-foreground mb-6">
        Live in <span className="font-serif text-primary">five</span> minutes.
      </h2>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-16 leading-relaxed">
        From signup to first embed in less time than it takes to make coffee. No setup calls, no engineers needed.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 relative w-full">
        {/* Connecting hairline */}
        <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent z-0" />

        {STEPS.map(({ icon: Icon, title, body, highlight }) => (
          <div key={title} className="relative z-10 flex flex-col items-center">
            <div
              className={cn(
                "w-24 h-24 rounded-full backdrop-blur-md flex items-center justify-center mb-6 transition-shadow",
                highlight
                  ? "bg-primary-soft border border-primary/30 text-primary shadow-[0_0_30px_rgba(255,89,94,0.20)]"
                  : "bg-white border border-border text-muted-foreground shadow-[0_4px_16px_-8px_rgba(15,15,15,0.10)]"
              )}
            >
              <Icon className="w-8 h-8" strokeWidth={1.5} />
              {highlight && (
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_rgba(255,89,94,0.6)]" />
              )}
            </div>
            <h3 className="text-xl font-semibold tracking-tight text-foreground mb-3">{title}</h3>
            <p className="text-muted-foreground text-center leading-relaxed max-w-xs">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
