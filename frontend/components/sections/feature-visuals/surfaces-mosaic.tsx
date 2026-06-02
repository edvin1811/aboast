import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

function MiniStars() {
  return (
    <div className="flex gap-0.5 text-primary">
      {[0, 1, 2, 3, 4].map((s) => (
        <Star key={s} className="w-2 h-2" fill="currentColor" strokeWidth={0} />
      ))}
    </div>
  );
}

function TestimonialContent({ compact = false }: { compact?: boolean }) {
  return (
    <>
      <MiniStars />
      <p
        className={cn(
          "text-foreground leading-snug",
          compact ? "text-[9px]" : "text-[10px]"
        )}
      >
        Aboast saved my launch week. So clean.
      </p>
      <div className="flex items-center gap-1.5">
        <div
          className="w-3.5 h-3.5 rounded-full border border-border grid place-items-center text-[7px] font-semibold text-foreground shrink-0"
          style={{ backgroundColor: "#ffd2c2" }}
        >
          S
        </div>
        <span className="text-[8px] font-medium text-foreground">Sarah J.</span>
      </div>
    </>
  );
}

/** Mini browser frame with an embedded testimonial widget */
function BrowserCard() {
  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden shadow-[0_8px_24px_-12px_rgba(15,15,15,0.18)] w-[180px]">
      <div className="bg-neutral-50 border-b border-border px-2 py-1.5 flex items-center gap-1.5">
        <div className="flex gap-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-200" />
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-200" />
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-200" />
        </div>
        <div className="flex-1 h-2 rounded bg-white border border-border" />
      </div>
      <div className="p-3 flex flex-col gap-1.5">
        <TestimonialContent />
      </div>
    </div>
  );
}

/** Mini email card */
function EmailCard() {
  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden shadow-[0_8px_24px_-12px_rgba(15,15,15,0.18)] w-[140px]">
      <div className="bg-neutral-50 border-b border-border px-2 py-1.5">
        <div className="h-1.5 rounded-full bg-neutral-200 w-3/5 mb-1" />
        <div className="h-1 rounded-full bg-neutral-200/70 w-2/5" />
      </div>
      <div className="p-3 flex flex-col gap-1.5">
        <TestimonialContent compact />
      </div>
    </div>
  );
}

/** Mini pop-up notification */
function PopupCard() {
  return (
    <div className="bg-white border border-border rounded-xl shadow-[0_8px_24px_-12px_rgba(15,15,15,0.18)] w-[150px] p-3 flex flex-col gap-1.5">
      <div className="flex items-start gap-2">
        <div
          className="w-5 h-5 rounded-full border border-border grid place-items-center text-[9px] font-semibold text-foreground shrink-0"
          style={{ backgroundColor: "#ffd2c2" }}
        >
          S
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-[8px] font-medium text-foreground">Sarah J.</span>
            <span className="w-1 h-1 rounded-full bg-primary shadow-[0_0_4px_rgba(255,89,94,0.6)]" />
          </div>
          <p className="text-[9px] text-muted-foreground leading-snug mt-0.5">
            Just signed up. Aboast is wild.
          </p>
        </div>
      </div>
    </div>
  );
}

/** Mini social-post card */
function SocialCard() {
  return (
    <div className="bg-white border border-border rounded-xl shadow-[0_8px_24px_-12px_rgba(15,15,15,0.18)] w-[150px] p-3 flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <div
          className="w-4 h-4 rounded-full border border-border grid place-items-center text-[7px] font-semibold text-foreground shrink-0"
          style={{ backgroundColor: "#ffd2c2" }}
        >
          S
        </div>
        <span className="text-[8px] font-medium text-foreground">@sarahj</span>
        <span className="text-[7px] text-muted-foreground ml-auto">2h</span>
      </div>
      <p className="text-[9px] text-foreground leading-snug">
        Aboast saved my launch week. So clean.
      </p>
    </div>
  );
}

/** Mini slide preview */
function SlideCard() {
  return (
    <div className="bg-white border border-border rounded-xl shadow-[0_8px_24px_-12px_rgba(15,15,15,0.18)] w-[160px] aspect-[16/10] p-3 flex flex-col justify-center items-center text-center">
      <div className="text-[8px] uppercase tracking-[0.12em] text-muted-foreground mb-1">
        Customer Story
      </div>
      <p className="text-[10px] font-medium text-foreground leading-snug font-serif italic">
        "Aboast saved my launch week."
      </p>
      <div className="text-[8px] text-muted-foreground mt-1">— Sarah J., UX Playbook</div>
    </div>
  );
}

export function SurfacesMosaic() {
  return (
    <div className="relative w-full h-[420px] md:h-[460px]">
      {/* Subtle primary glow underneath */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-1/2 bg-primary/[0.06] blur-[60px] rounded-full pointer-events-none" />

      {/* Email — top left */}
      <div className="absolute top-[2%] left-[3%] z-10" style={{ transform: "rotate(-5deg)" }}>
        <EmailCard />
      </div>

      {/* Slide — top right */}
      <div className="absolute top-[0%] right-[2%] z-10" style={{ transform: "rotate(4deg)" }}>
        <SlideCard />
      </div>

      {/* Browser — center */}
      <div
        className="absolute top-1/2 left-1/2 z-20"
        style={{ transform: "translate(-50%, -50%) rotate(-1deg)" }}
      >
        <BrowserCard />
      </div>

      {/* Pop-up — bottom left */}
      <div className="absolute bottom-[4%] left-[1%] z-10" style={{ transform: "rotate(-3deg)" }}>
        <PopupCard />
      </div>

      {/* Social — bottom right */}
      <div className="absolute bottom-[2%] right-[3%] z-10" style={{ transform: "rotate(5deg)" }}>
        <SocialCard />
      </div>
    </div>
  );
}
