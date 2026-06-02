import { ArrowUp } from "lucide-react";

/** Two bars side by side — short neutral "before", taller primary "after" — with a lift arrow. Visualizes conversion lift. */
export function LiftBars() {
  return (
    <div className="w-full flex items-end justify-center gap-4 h-[120px] max-w-[200px] mx-auto relative">
      <div className="flex flex-col items-center gap-2">
        <div className="w-10 h-12 rounded-t-md bg-neutral-200 border border-border border-b-0" />
        <span className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/70">Before</span>
      </div>
      <div className="flex flex-col items-center gap-2 relative">
        <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-primary text-white grid place-items-center shadow-[0_0_12px_rgba(255,89,94,0.40)]">
          <ArrowUp className="w-3 h-3" strokeWidth={2.5} />
        </div>
        <div className="w-10 h-20 rounded-t-md bg-primary-soft border border-primary/30 border-b-0 shadow-[0_0_24px_rgba(255,89,94,0.18)]" />
        <span className="text-[10px] uppercase tracking-[0.1em] text-primary font-medium">After</span>
      </div>
    </div>
  );
}
