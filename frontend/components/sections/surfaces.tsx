import { Globe, Mail, AtSign, Presentation, Bell } from "lucide-react";
import { SurfacesMosaic } from "./feature-visuals/surfaces-mosaic";

const SURFACES = [
  { icon: Globe, label: "Embed widgets on your site" },
  { icon: Mail, label: "Drop quotes into email signatures" },
  { icon: AtSign, label: "Auto-post to X, LinkedIn, Bluesky" },
  { icon: Presentation, label: "Export to sales decks and one-pagers" },
  { icon: Bell, label: "Trigger pop-ups on key conversion pages" },
];

export function Surfaces() {
  return (
    <section className="w-full max-w-6xl mx-auto mt-32 px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
        <div>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-foreground mb-6 leading-[1.1]">
            Proof,{" "}
            <span className="font-serif ext-3xl md:text-5xl text-primary">everywhere</span> it counts.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            One testimonial turns into proof on your site, in your emails, across your socials, inside your pitch decks. Wherever customers look — you show up.
          </p>
          <ul className="space-y-3.5">
            {SURFACES.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3 text-[15px] text-foreground">
                <span className="w-8 h-8 rounded-lg bg-primary-soft border border-primary/20 grid place-items-center text-primary shrink-0">
                  <Icon className="w-4 h-4" strokeWidth={1.75} />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <SurfacesMosaic />
        </div>
      </div>
    </section>
  );
}
