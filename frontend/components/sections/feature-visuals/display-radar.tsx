import { Star } from "lucide-react";

export function DisplayRadar() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Concentric rings */}
        <div className="absolute w-full h-full rounded-full border border-border border-dashed" />
        <div className="absolute w-[70%] h-[70%] rounded-full border border-border" />
        <div className="absolute w-[55%] h-[55%] rounded-full border border-primary/30" />

        {/* Orbiting dots */}
        <div className="absolute top-[15%] left-[15%] w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(255,89,94,0.5)]" />
        <div className="absolute bottom-[20%] right-[10%] w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(255,89,94,0.5)]" />
        <div className="absolute top-[40%] right-[5%] w-1 h-1 rounded-full bg-foreground/30" />
        <div className="absolute bottom-[10%] left-[30%] w-1 h-1 rounded-full bg-foreground/30" />
        <div className="absolute top-[20%] right-[28%] w-1 h-1 rounded-full bg-foreground/20" />

        {/* Center mini testimonial */}
        <div className="relative z-10 w-[104px] bg-white border border-border rounded-xl p-2.5 shadow-[0_0_24px_rgba(255,89,94,0.20),0_1px_2px_rgba(15,15,15,0.06),0_8px_16px_-8px_rgba(15,15,15,0.10)]">
          <div className="flex gap-0.5 text-primary mb-1.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} className="w-[7px] h-[7px]" fill="currentColor" strokeWidth={0} />
            ))}
          </div>
          <p className="text-[8px] leading-snug text-foreground font-medium mb-1.5 line-clamp-2">
            "Aboast saved my launch week."
          </p>
          <div className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded-full border border-border grid place-items-center text-[6px] font-semibold text-foreground shrink-0"
              style={{ backgroundColor: "#ffd2c2" }}
            >
              S
            </div>
            <span className="text-[7px] font-medium text-foreground/80">Sarah J.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
