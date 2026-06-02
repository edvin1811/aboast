import { Triangle, Asterisk, Activity, Aperture, Hexagon } from "lucide-react";

const LOGOS = [
  { Icon: Triangle, name: "Acme", cls: "font-semibold tracking-tight" },
  { Icon: Asterisk, name: "Lumen", cls: "font-semibold tracking-widest uppercase text-base" },
  { Icon: Activity, name: "Nova", cls: "font-semibold tracking-tight" },
  { Icon: Aperture, name: "PULSE", cls: "font-semibold tracking-wider" },
  { Icon: Hexagon, name: "atelier", cls: "font-medium tracking-tight lowercase" },
];

export function TrustedBy() {
  return (
    <section className="w-full max-w-4xl mx-auto mt-32 px-6 border-t border-border pt-12">
      <h4 className="text-xs font-semibold tracking-[0.2em] text-muted-foreground/70 text-center uppercase mb-10">
        Trusted by teams building in public
      </h4>

      <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 text-foreground/70 grayscale hover:grayscale-0 transition-all duration-500">
        {LOGOS.map(({ Icon, name, cls }) => (
          <div key={name} className="flex items-center gap-2">
            <Icon className="w-6 h-6" strokeWidth={1.5} />
            <span className={`text-xl ${cls}`}>{name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
