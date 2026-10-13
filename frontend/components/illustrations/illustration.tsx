import Image from "next/image";
import { Check, Minus, Star } from "lucide-react";
import type { IllustrationSpec, QuoteCard } from "@/lib/illustrations";
import { cn } from "@/lib/utils";
import { Icon } from "./icons";

// One canvas, 1200px wide, in the site's own look: the warm canvas, a soft
// brand glow, white cards and the brand red. Rendered to JPG by
// scripts/illustrations.mjs.

const WIDTH = 1200;

/** Review sources a quote card can name. */
export const SOURCES: Record<string, string> = {
  google: "Google",
  trustpilot: "Trustpilot",
  yelp: "Yelp",
  tripadvisor: "Tripadvisor",
  form: "Collection form",
  email: "Email",
};

function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <span className="grid shrink-0 place-items-center rounded-full border border-primary/30 bg-primary-soft font-bold text-primary" style={{ width: size, height: size, fontSize: size * 0.42 }}>
      {name.trim()[0]?.toUpperCase()}
    </span>
  );
}

function Stars({ count = 5, size = 20 }: { count?: number; size?: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${count} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} size={size} strokeWidth={0} className={i < count ? "fill-primary" : "fill-border"} />
      ))}
    </span>
  );
}

/* —— Quotes: example testimonial cards —— */

function Quotes({ quotes }: { quotes: QuoteCard[] }) {
  const wide = quotes.length === 1;
  return (
    <div className="flex w-full items-stretch justify-center gap-6">
      {quotes.map((q, i) => (
        <figure
          key={i}
          className={cn(
            "flex flex-col rounded-[28px] border border-border bg-white p-7 shadow-[0_40px_70px_-38px_rgba(15,15,15,0.45)]",
            wide ? "max-w-[760px]" : "flex-1",
          )}
        >
          {/* Every card says "Example": these are made-up quotes, and on an
              aboast.com image they must never read as real customers. */}
          <div className="flex items-center justify-between gap-3">
            <Stars count={q.stars ?? 5} size={wide ? 24 : 21} />
            <span className="shrink-0 whitespace-nowrap rounded-full border border-dashed border-primary/50 px-3 py-1 text-[14px] font-semibold text-primary-hover">Example</span>
          </div>
          <blockquote className={cn("mt-5 flex-1 font-medium leading-snug tracking-tight", wide ? "text-[30px]" : "text-[22px]")}>“{q.text}”</blockquote>
          <figcaption className="mt-6 flex items-center gap-3">
            <Avatar name={q.name} />
            <span className="leading-tight">
              <span className="block text-[18px] font-bold">{q.name}</span>
              {(q.role || q.source) && (
                <span className="block text-[15px] text-muted-foreground">{[q.role, q.source && SOURCES[q.source] && `via ${SOURCES[q.source]}`].filter(Boolean).join(" · ")}</span>
              )}
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

/* —— Email: a request email written out —— */

function Email({ from, subject, body, button }: Extract<IllustrationSpec, { type: "email" }>) {
  return (
    <div className="w-full max-w-[860px] overflow-hidden rounded-[28px] border border-border bg-white shadow-[0_40px_80px_-40px_rgba(15,15,15,0.4)]">
      <div className="flex items-center gap-2 border-b border-border bg-muted px-6 py-3.5" aria-hidden="true">
        <span className="size-3 rounded-full bg-[#ff5f57]" />
        <span className="size-3 rounded-full bg-[#febc2e]" />
        <span className="size-3 rounded-full bg-[#28c840]" />
      </div>
      <div className="grid gap-1.5 border-b border-border px-8 py-5 text-[18px]">
        <p><span className="inline-block w-20 text-muted-foreground">From</span><span className="font-semibold">{from}</span></p>
        <p><span className="inline-block w-20 text-muted-foreground">Subject</span><span className="font-bold">{subject}</span></p>
      </div>
      <div className="grid gap-3.5 px-8 py-7 text-[21px] leading-snug">
        {body.map((p, i) => <p key={i}>{p}</p>)}
        {button && (
          <span className="mt-2 inline-flex w-fit items-center rounded-full bg-primary px-6 py-3 text-[19px] font-semibold text-white shadow-[0_10px_24px_-10px_rgba(255,89,94,0.8)]">{button}</span>
        )}
      </div>
    </div>
  );
}

/* —— Steps —— */

function Steps({ steps }: Extract<IllustrationSpec, { type: "steps" }>) {
  if (steps.length >= 5) {
    return (
      <ol className="relative grid w-full max-w-[940px] gap-3">
        <span className="absolute bottom-8 left-[39px] top-8 w-0.5 bg-gradient-to-b from-primary/50 to-primary/10" aria-hidden="true" />
        {steps.map((s, i) => (
          <li key={i} className="relative flex items-center gap-5 rounded-[24px] border border-border bg-white px-5 py-4 shadow-[0_24px_50px_-36px_rgba(15,15,15,0.4)]">
            <span className="relative grid size-14 shrink-0 place-items-center rounded-2xl bg-primary text-white shadow-[0_12px_24px_-12px_rgba(255,89,94,0.8)]">
              <Icon name={s.icon} size={26} />
              <span className="absolute -right-2 -top-2 grid size-7 place-items-center rounded-full bg-foreground text-[14px] font-bold text-white ring-4 ring-white">{i + 1}</span>
            </span>
            <span className="min-w-0">
              <span className="block text-[25px] font-bold leading-tight tracking-[-0.03em]">{s.title}</span>
              {s.body && <span className="mt-0.5 block text-[19px] leading-snug text-muted-foreground">{s.body}</span>}
            </span>
          </li>
        ))}
      </ol>
    );
  }
  return (
    <div className="flex w-full items-stretch justify-center gap-3">
      {steps.map((s, i) => (
        <div key={i} className="flex flex-1 items-center gap-3">
          <div className="relative flex h-full flex-1 flex-col rounded-[26px] border border-border bg-white p-6 shadow-[0_30px_60px_-35px_rgba(15,15,15,0.4)]">
            <span className="grid size-14 place-items-center rounded-2xl bg-primary text-white shadow-[0_12px_24px_-12px_rgba(255,89,94,0.8)]"><Icon name={s.icon} size={26} /></span>
            <span className="absolute right-5 top-5 text-[44px] font-bold leading-none tracking-[-0.06em] text-primary/20">{i + 1}</span>
            <p className="mt-5 text-[26px] font-bold leading-[1.1] tracking-[-0.03em]">{s.title}</p>
            {s.body && <p className="mt-2 text-[19px] leading-snug text-muted-foreground">{s.body}</p>}
          </div>
          {i < steps.length - 1 && <span className="shrink-0 text-[26px] font-bold text-primary/50">→</span>}
        </div>
      ))}
    </div>
  );
}

/* —— Compare —— */

function Cell({ value }: { value: string }) {
  if (value === "yes") return <span className="grid size-9 place-items-center rounded-full bg-primary text-white"><Check size={19} strokeWidth={3} /></span>;
  if (value === "no") return <span className="grid size-9 place-items-center rounded-full bg-muted text-muted-foreground"><Minus size={19} strokeWidth={3} /></span>;
  return <span className="text-[21px] font-semibold leading-snug tracking-tight">{value}</span>;
}

function Compare({ columns, rows, footnote }: Extract<IllustrationSpec, { type: "compare" }>) {
  const label = columns.length === 3 ? 28 : 34;
  const col = (100 - label) / columns.length;
  const grid = { gridTemplateColumns: `${label}% repeat(${columns.length}, ${col}%)` };
  return (
    <div className="w-full max-w-[1000px]">
      <div className="relative overflow-hidden rounded-[28px] border border-border bg-white shadow-[0_40px_80px_-40px_rgba(15,15,15,0.35)]">
        {columns.map((c, i) => c.highlight && (
          <div key={i} className="pointer-events-none absolute inset-y-0 bg-primary-soft/70" style={{ left: `${label + col * i}%`, width: `${col}%` }} aria-hidden="true" />
        ))}
        <div className="relative grid items-end border-b border-border px-6 pb-5 pt-6" style={grid}>
          <span />
          {columns.map((c) => (
            <span key={c.name} className="flex items-center gap-2.5 px-4">
              {c.name === "Aboast" && <Image src="/logo-color.svg" alt="" width={30} height={30} />}
              <span className="leading-tight"><span className="block text-[25px] font-bold tracking-[-0.03em]">{c.name}</span>{c.note && <span className="mt-0.5 block text-[16px] font-medium text-muted-foreground">{c.note}</span>}</span>
            </span>
          ))}
        </div>
        {rows.map((r, i) => (
          <div key={i} className={cn("relative grid items-center px-6 py-3.5", i < rows.length - 1 && "border-b border-border")} style={grid}>
            <span className="text-[19px] font-semibold leading-snug text-muted-foreground">{r.label}</span>
            {r.values.map((v, j) => <span key={j} className="px-4"><Cell value={v} /></span>)}
          </div>
        ))}
      </div>
      {footnote && <p className="mt-4 text-center text-[16px] font-medium text-muted-foreground">{footnote}</p>}
    </div>
  );
}

/* —— Checklist —— */

function Checklist({ title, items }: Extract<IllustrationSpec, { type: "checklist" }>) {
  const twoCols = items.length > 6;
  return (
    <div className="w-full max-w-[1000px] rounded-[30px] border border-border bg-white p-10 shadow-[0_40px_80px_-40px_rgba(15,15,15,0.35)]">
      <p className="text-[32px] font-bold leading-tight tracking-[-0.03em]">{title}</p>
      <ul className={cn("mt-6 grid gap-x-10 gap-y-4", twoCols && "grid-cols-2")}>
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-primary text-white"><Check size={17} strokeWidth={3.2} /></span>
            <span className={cn("font-medium leading-snug tracking-tight", twoCols ? "text-[21px]" : "text-[24px]")}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* —— Tiles —— */

function Tiles({ tiles }: Extract<IllustrationSpec, { type: "tiles" }>) {
  const cols = tiles.length === 4 ? 2 : tiles.length <= 3 ? tiles.length : 3;
  return (
    <div className="grid w-full gap-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {tiles.map((t, i) => (
        <div key={i} className="flex items-start gap-4 rounded-[26px] border border-border bg-white p-6 shadow-[0_30px_60px_-38px_rgba(15,15,15,0.4)]">
          <span className={cn("grid size-14 shrink-0 place-items-center rounded-2xl", i === 0 ? "bg-primary text-white" : "bg-primary-soft text-primary-hover")}><Icon name={t.icon} size={26} /></span>
          <span>
            <span className="block text-[25px] font-bold leading-[1.1] tracking-[-0.03em]">{t.title}</span>
            {t.body && <span className="mt-1.5 block text-[19px] leading-snug text-muted-foreground">{t.body}</span>}
          </span>
        </div>
      ))}
    </div>
  );
}

/* —— Timeline —— */

function Timeline({ phases }: Extract<IllustrationSpec, { type: "timeline" }>) {
  const dense = phases.length > 5;
  return (
    <div className="relative w-full">
      <div className="absolute left-0 right-0 top-[23px] h-1 rounded-full bg-gradient-to-r from-primary/20 via-primary/60 to-primary/20" aria-hidden="true" />
      <div className={cn("relative grid", dense ? "gap-3" : "gap-4")} style={{ gridTemplateColumns: `repeat(${phases.length}, minmax(0, 1fr))` }}>
        {phases.map((p, i) => (
          <div key={i} className="flex flex-col items-center">
            <span className={cn("grid size-12 place-items-center rounded-full text-[19px] font-bold ring-[6px] ring-background", p.peak ? "bg-primary text-white" : "bg-white text-primary-hover shadow-[inset_0_0_0_2px_var(--color-primary)]")}>{i + 1}</span>
            <div className={cn("mt-5 w-full rounded-[24px] border shadow-[0_30px_60px_-38px_rgba(15,15,15,0.4)]", dense ? "p-4" : "p-5", p.peak ? "border-primary bg-primary text-white" : "border-border bg-white")}>
              <p className={cn("font-bold uppercase tracking-[0.06em]", dense ? "text-[14px]" : "text-[15px]", p.peak ? "text-white/85" : "text-primary-hover")}>{p.when}</p>
              <p className={cn("mt-2 font-bold leading-[1.1] tracking-[-0.03em]", dense ? "text-[20px] [overflow-wrap:break-word]" : "text-[24px]")}>{p.title}</p>
              {p.body && <p className={cn("mt-2 leading-snug", dense ? "text-[16px]" : "text-[17px]", p.peak ? "text-white/90" : "text-muted-foreground")}>{p.body}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* —— Fan-out: one thing becomes many —— */

function Fanout({ source, outputs }: Extract<IllustrationSpec, { type: "fanout" }>) {
  return (
    <div className="grid w-full grid-cols-[0.78fr_auto_1.22fr] items-center gap-5">
      <div className="rounded-[28px] bg-primary p-7 text-white shadow-[0_40px_70px_-30px_rgba(255,89,94,0.7)]">
        <span className="grid size-16 place-items-center rounded-2xl bg-white/20"><Icon name={source.icon} size={30} /></span>
        <p className="mt-6 text-[38px] font-bold leading-[1.02] tracking-[-0.04em]">{source.title}</p>
        {source.body && <p className="mt-3 text-[21px] leading-snug text-white/90">{source.body}</p>}
      </div>
      <svg width="70" height="300" viewBox="0 0 70 300" fill="none" aria-hidden="true">
        {outputs.map((_, i) => {
          const y = outputs.length === 1 ? 150 : 20 + (i * 260) / (outputs.length - 1);
          return <path key={i} d={`M0 150 C35 150 35 ${y} 70 ${y}`} stroke="var(--color-primary)" strokeOpacity="0.45" strokeWidth="2" strokeDasharray="5 6" />;
        })}
      </svg>
      <ul className="grid gap-2.5">
        {outputs.map((o, i) => (
          <li key={i} className="flex items-center gap-3.5 rounded-2xl border border-border bg-white px-4 py-3.5 shadow-[0_16px_32px_-24px_rgba(15,15,15,0.45)]">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-hover"><Icon name={o.icon} size={21} /></span>
            <span className="min-w-0 flex-1 text-[20px] font-semibold leading-snug tracking-tight">{o.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* —— Bars —— */

function Bars({ bars, unit, log }: Extract<IllustrationSpec, { type: "bars" }>) {
  const max = Math.max(...bars.map((b) => b.value));
  const width = (v: number) => (log ? (Math.log10(v) / Math.log10(max)) * 100 : (v / max) * 100);
  return (
    <div className="w-full max-w-[1040px] rounded-[30px] border border-border bg-white p-9 shadow-[0_40px_80px_-40px_rgba(15,15,15,0.35)]">
      <ul className="grid gap-4">
        {bars.map((b, i) => (
          <li key={i} className="grid grid-cols-[38px_200px_1fr] items-center gap-3.5">
            {b.icon ? <span className="grid size-[38px] place-items-center rounded-xl bg-primary-soft text-primary-hover"><Icon name={b.icon} size={20} /></span> : <span />}
            <span className="truncate text-[21px] font-bold tracking-tight">{b.label}</span>
            <span className="flex items-center gap-3">
              <span className="h-9 rounded-lg bg-gradient-to-r from-primary to-[#ff8a8d]" style={{ width: `${Math.max(4, width(b.value) * 0.78)}%` }} />
              <span className="text-[23px] font-bold tabular-nums tracking-tight">{b.value.toLocaleString("en-US")}</span>
            </span>
          </li>
        ))}
      </ul>
      {unit && <p className="mt-5 text-right text-[16px] font-semibold text-muted-foreground">{unit}{log ? " · log scale" : ""}</p>}
    </div>
  );
}

/* —— Frame —— */

function defaultHeight(spec: IllustrationSpec): number {
  switch (spec.type) {
    case "tiles": return spec.tiles.length <= 3 ? 470 : spec.tiles.length === 4 ? 540 : 620;
    case "steps": return spec.steps.length >= 5 ? 700 : 520;
    case "checklist": return 560;
    case "timeline": return 560;
    case "fanout": return 600;
    case "quotes": return 600;
    case "email": return 560;
    default: return 600;
  }
}

export function Illustration({ spec }: { spec: IllustrationSpec }) {
  const height = spec.height ?? defaultHeight(spec);
  let body: React.ReactNode = null;
  switch (spec.type) {
    case "quotes": body = <Quotes quotes={spec.quotes} />; break;
    case "email": body = <Email {...spec} />; break;
    case "steps": body = <Steps {...spec} />; break;
    case "compare": body = <Compare {...spec} />; break;
    case "checklist": body = <Checklist {...spec} />; break;
    case "tiles": body = <Tiles {...spec} />; break;
    case "timeline": body = <Timeline {...spec} />; break;
    case "fanout": body = <Fanout {...spec} />; break;
    case "bars": body = <Bars {...spec} />; break;
  }
  return (
    <div id="illustration" className="relative flex flex-col overflow-hidden bg-background text-foreground" style={{ width: WIDTH, minHeight: height }}>
      <div className="pointer-events-none absolute -right-40 -top-40 size-[560px] rounded-full bg-primary/20 blur-[110px]" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-48 -left-40 size-[520px] rounded-full bg-primary/10 blur-[110px]" aria-hidden="true" />
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />

      <div className="relative flex items-center justify-between px-12 pt-10">
        {spec.label ? <span className="rounded-full bg-white px-4 py-2 text-[17px] font-bold uppercase tracking-[0.1em] text-primary-hover shadow-[0_8px_20px_-14px_rgba(15,15,15,0.4)]">{spec.label}</span> : <span />}
        <span className="flex items-center gap-2 text-[19px] font-bold tracking-[-0.03em] text-foreground/70">
          <Image src="/logo-color.svg" alt="" width={24} height={24} /> aboast.com
        </span>
      </div>
      {spec.heading && <p className="relative px-12 pt-4 text-[34px] font-bold leading-[1.08] tracking-[-0.04em]">{spec.heading}</p>}
      <div className="relative flex flex-1 items-center justify-center px-12 pb-10 pt-6">{body}</div>
    </div>
  );
}
