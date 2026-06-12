import { Star, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const TS = [
  { quote: "Aboast saved my launch week. Customers love how easy it is.", name: "Sarah J.", role: "UX Playbook", initial: "S", color: "#ffd2c2" },
  { quote: "Replaced a Notion doc, a Google Form, and a Webflow embed in one move.", name: "Marcus T.", role: "Lumen", initial: "M", color: "#ffe3a8" },
  { quote: "Best ROI of any tool we added this year. Period.", name: "Alex P.", role: "Nova", initial: "A", color: "#ffd2c2" },
  { quote: "Setup took five minutes. Embed worked first try.", name: "Riya K.", role: "Pulse", initial: "R", color: "#ffe3a8" },
  { quote: "Pricing page conversion jumped 18% the first week.", name: "Tomas L.", role: "Acme", initial: "T", color: "#ffd2c2" },
  { quote: "We see real lift in trial signups from the wall.", name: "Jordan M.", role: "Atelier", initial: "J", color: "#ffe3a8" },
];

type StarSize = "xs" | "sm" | "md";
const STAR_SIZE: Record<StarSize, string> = {
  xs: "w-2.5 h-2.5",
  sm: "w-3 h-3",
  md: "w-3.5 h-3.5",
};

function MiniStars({ size = "sm" }: { size?: StarSize }) {
  return (
    <div className="flex gap-0.5 text-primary">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} className={STAR_SIZE[size]} fill="currentColor" strokeWidth={0} />
      ))}
    </div>
  );
}

function Avatar({ initial, color, size = "sm" }: { initial: string; color: string; size?: "sm" | "md" }) {
  const cls = { sm: "w-6 h-6 text-[10px]", md: "w-8 h-8 text-xs" }[size];
  return (
    <div
      className={cn(cls, "rounded-full border border-border grid place-items-center font-semibold text-foreground shrink-0")}
      style={{ backgroundColor: color }}
    >
      {initial}
    </div>
  );
}

/* ─── Widget mockups — compact for the vertical marquee ──────── */

function WallMock() {
  return (
    <div className="grid grid-cols-2 gap-2 w-full">
      {TS.slice(0, 4).map((t, i) => (
        <div
          key={i}
          className="bg-white border border-border rounded-2xl p-3 shadow-[0_1px_2px_rgba(15,15,15,0.04),0_4px_12px_-6px_rgba(15,15,15,0.08)]"
        >
          <MiniStars size="xs" />
          <p className="text-[11px] text-foreground my-1.5 leading-snug line-clamp-2">{t.quote}</p>
          <div className="flex items-center gap-1.5">
            <Avatar initial={t.initial} color={t.color} size="sm" />
            <p className="text-[10px] font-medium text-foreground truncate">{t.name}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function CarouselMock() {
  const t = TS[0];
  return (
    <div className="relative bg-white border border-border rounded-2xl p-5 w-full shadow-[0_1px_2px_rgba(15,15,15,0.04),0_8px_24px_-12px_rgba(15,15,15,0.12)] text-center">
      <button className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-border grid place-items-center text-muted-foreground" aria-label="prev">
        <ChevronLeft className="w-3 h-3" strokeWidth={1.75} />
      </button>
      <button className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-border grid place-items-center text-muted-foreground" aria-label="next">
        <ChevronRight className="w-3 h-3" strokeWidth={1.75} />
      </button>
      <div className="flex justify-center mb-2">
        <MiniStars size="sm" />
      </div>
      <p className="text-[13px] text-foreground mb-3 leading-snug font-medium px-6">
        &ldquo;{t.quote}&rdquo;
      </p>
      <div className="flex items-center justify-center gap-2">
        <Avatar initial={t.initial} color={t.color} size="sm" />
        <div className="text-left">
          <p className="text-[11px] font-medium text-foreground leading-tight">{t.name}</p>
          <p className="text-[10px] text-muted-foreground">{t.role}</p>
        </div>
      </div>
      <div className="flex gap-1 justify-center mt-3">
        <span className="w-1 h-1 rounded-full bg-neutral-300" />
        <span className="w-4 h-1 rounded-full bg-primary" />
        <span className="w-1 h-1 rounded-full bg-neutral-300" />
      </div>
    </div>
  );
}

function MarqueeMock() {
  const doubled = [...TS, ...TS];
  return (
    <div className="relative w-full overflow-hidden bg-white border border-border rounded-2xl py-3 shadow-[0_1px_2px_rgba(15,15,15,0.04),0_4px_12px_-6px_rgba(15,15,15,0.08)]">
      <div
        className="flex gap-2 w-max"
        style={{ animation: "marquee-track 28s linear infinite" }}
      >
        {doubled.map((t, i) => (
          <div
            key={i}
            className="bg-neutral-50 border border-border rounded-xl p-2.5 shrink-0 w-[180px]"
          >
            <MiniStars size="xs" />
            <p className="text-[10px] text-foreground my-1 leading-snug line-clamp-2">{t.quote}</p>
            <p className="text-[9px] text-muted-foreground">— {t.name}</p>
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent" />
    </div>
  );
}

function BadgeMock() {
  return (
    <div className="flex justify-center w-full">
      <div className="bg-white border border-border rounded-2xl px-5 py-3 flex items-center gap-3 shadow-[0_1px_2px_rgba(15,15,15,0.04),0_8px_24px_-12px_rgba(15,15,15,0.12)]">
        <div className="text-3xl font-semibold text-foreground leading-none tracking-tight">4.9</div>
        <div>
          <MiniStars size="sm" />
          <p className="text-[10px] text-muted-foreground mt-0.5">1,287 reviews</p>
        </div>
      </div>
    </div>
  );
}

function FeaturedMock() {
  const t = TS[2];
  return (
    <div className="relative bg-white border border-border rounded-2xl p-5 w-full shadow-[0_1px_2px_rgba(15,15,15,0.04),0_8px_24px_-12px_rgba(15,15,15,0.12)] text-center overflow-hidden">
      <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="flex justify-center mb-2.5">
        <MiniStars size="md" />
      </div>
      <p className="text-base text-foreground font-medium leading-relaxed mb-3">
        &ldquo;{t.quote}&rdquo;
      </p>
      <div className="flex items-center justify-center gap-2">
        <Avatar initial={t.initial} color={t.color} size="md" />
        <div className="text-left">
          <p className="text-[11px] font-medium text-foreground leading-tight">{t.name}</p>
          <p className="text-[10px] text-muted-foreground">{t.role}</p>
        </div>
      </div>
    </div>
  );
}

function ListMock() {
  return (
    <div className="space-y-1.5 w-full">
      {TS.slice(0, 3).map((t, i) => (
        <div
          key={i}
          className="bg-white border border-border rounded-xl p-2.5 flex items-center gap-2.5 shadow-[0_1px_2px_rgba(15,15,15,0.04),0_4px_12px_-6px_rgba(15,15,15,0.08)]"
        >
          <Avatar initial={t.initial} color={t.color} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <MiniStars size="xs" />
              <p className="text-[10px] text-muted-foreground truncate">{t.name}</p>
            </div>
            <p className="text-[11px] text-foreground line-clamp-1 mt-0.5">&ldquo;{t.quote}&rdquo;</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Section ────────────────────────────────────────────────── */

const WIDGETS = [
  { name: "Wall of love", Component: WallMock },
  { name: "Carousel", Component: CarouselMock },
  { name: "Marquee", Component: MarqueeMock },
  { name: "Rating badge", Component: BadgeMock },
  { name: "Featured quote", Component: FeaturedMock },
  { name: "List", Component: ListMock },
];

export function WidgetShowcase() {
  return (
    <section className="w-full max-w-5xl mx-auto mt-32 px-6 relative">
      {/* Soft primary halo behind */}
      <div className="absolute inset-0 bg-primary/[0.10] blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 bg-white border border-border rounded-2xl overflow-hidden shadow-[0_1px_2px_rgba(15,15,15,0.04),0_24px_48px_-24px_rgba(15,15,15,0.16)]">
        {/* Hairlines */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent z-20" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent z-20" />

        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-[480px] md:h-[480px] overflow-hidden">
          {/* Left: vertical marquee — fixed-height window the widgets scroll through */}
          <div className="relative overflow-hidden h-[360px] md:h-full border-b md:border-b-0 md:border-r border-border bg-white order-2 md:order-1">
            <div
              className="flex flex-col gap-5 p-6"
              style={{ animation: "marquee-vertical 38s linear infinite" }}
            >
              {[...WIDGETS, ...WIDGETS].map(({ Component }, i) => (
                <div key={i} className="shrink-0 w-full max-w-[320px] mx-auto">
                  <Component />
                </div>
              ))}
            </div>

            {/* Top + bottom fade overlays — replace the mask-image so it doesn't
                break percentage transforms on the animated child */}
            <div className="pointer-events-none absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white to-transparent z-10" />
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent z-10" />
          </div>

          {/* Right: text */}
          <div className="flex flex-col justify-center p-8 md:p-10 lg:p-12 order-1 md:order-2 overflow-hidden">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground mb-5 leading-[1.1]">
              A widget for every{" "}
              <span className="font-serif italic text-primary">vibe</span>.
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-7">
              Walls, carousels, badges, marquees — pick the one that fits your page and drop it in.
            </p>
            <ul className="space-y-2.5">
              {WIDGETS.map(({ name }) => (
                <li
                  key={name}
                  className="flex items-center gap-2.5 text-sm text-foreground"
                >
                  <span className="w-5 h-5 rounded-full bg-primary-soft border border-primary/30 grid place-items-center text-primary shrink-0">
                    <Check className="w-3 h-3" strokeWidth={2.5} />
                  </span>
                  {name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
