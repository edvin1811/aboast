# Aboast Design System

This document is the source of truth for the aboast public-facing design (landing page + blog). Read it before adding new sections, components, or pages so visual decisions stay coherent across the surface.

## Overview

The aboast aesthetic reads as **bright, calm, and modern with one warm accent that earns its attention**. Everything sits on a soft warm-white canvas (`#fafaf7`) with a barely-visible top-center radial wash of the primary red. Surfaces are white cards with hairline borders and soft shadows; the only chromatic element is the brand red, which appears sparingly as: CTA fill, the serif-italic highlight word in headlines, focus rings, the active-nav dot, star ratings, the small "new" pulse, and the bottom-glow tint inside feature cards. Everything else is neutral grayscale.

The design is patterned after a verdant-saas-21 reference (Aura template) inverted from dark to light, with brand-green swapped for `#ff595e`. The result feels closer to Linear or Vercel than to a typical SaaS landing page: lots of whitespace, soft elevation, and one quiet typographic device — a single serif-italic word inside an otherwise sans-serif headline — that gives every page a single point of editorial warmth.

**Key characteristics:**

- One-canvas system: every section sits on the same `#fafaf7` page with a fixed radial wash behind it. No alternating light/dark bands, no two-tone color blocks. Visual rhythm comes from spacing and card elevation, not from background color shifts.
- Single chromatic accent: `#ff595e` (and only `#ff595e`). Every "color" in the design is either neutral or this red. No secondary brand colors, no per-section accents.
- The serif-italic highlight device: every major headline contains exactly one word (or short phrase) rendered in `font-serif italic text-primary` — `Turn customer love into your best sales tool`, `Loved by founders`, `Ready to ship social proof`. Use it once per headline, never twice, never elsewhere.
- Pill geometry: the nav is a floating pill, badges are pills, all buttons are pills (`rounded-full`). Cards stay rounded-3xl (`1.5rem`) so the contrast between the round buttons and the soft-cornered cards reads cleanly.
- Soft elevation, not flat: every card carries a two-layer shadow (a 1px hairline shadow + a longer, more diffuse depth shadow). Avoid `shadow-sm`/`shadow-md` from Tailwind — use the recipe below.
- Red glow only on red: the only `box-shadow` with color in the system is a soft red halo on CTA buttons and primary icon tiles. Never use a glow shadow with neutral grays — that reads tacky on white.

## Colors

All tokens live in [app/globals.css](app/globals.css) under `@theme`. Reference them as Tailwind classes (`text-primary`, `bg-muted`, etc.) — never hard-code hex values in components.

### Brand
- **Primary** (`--color-primary` — `#ff595e`): The single chromatic accent. CTA fill, serif-italic highlight word, focus rings, the active-nav dot, star ratings, in-card icon tile foreground, the "new" pulse dot.
- **Primary Hover** (`--color-primary-hover` — `#ec4046`): Pressed/hovered state of the primary CTA. Slightly deeper saturation — keep it for `:hover` only, never as a default fill.
- **Primary Soft** (`--color-primary-soft` — `#ffe7e6`): Light pink fill of icon tiles inside cards (the 10×10 lucide-icon container), the "highlighted" step in the Process row, in-article CTA badges. Always paired with `border-primary/30` and a `text-primary` foreground.
- **Primary Foreground** (`--color-primary-foreground` — `#ffffff`): Text and icons on primary fills.

### Surface
- **Background** (`--color-background` — `#fafaf7`): The page canvas. Slightly warm off-white — never use pure `#ffffff` for the page.
- **Card** (`--color-card` — `#ffffff`): All elevated surfaces — feature cards, testimonial cards, the CTA box, blog post cards, the pricing tiers, the nav pill (at 75% alpha + blur). Pure white so cards read as floating above the warm canvas.
- **Muted** (`--color-muted` — `#f4f4f1`): Pressed/hover background of ghost buttons and mobile sheet items. Use sparingly.

### Text
- **Foreground** (`--color-foreground` — `#0a0a0a`): Headlines, primary body text, and the dark "Pro" tier in the pricing card.
- **Muted Foreground** (`--color-muted-foreground` — `#6b6b6b`): Subheadlines, body copy, descriptive sentences, captions, eyebrow labels, trust-row text.
- For body copy *inside* card content, use `text-muted-foreground`. For section subheadings under a hero/section title, also `text-muted-foreground`. Don't use `text-foreground/60` or other arbitrary opacities — use the token.

### Borders
- **Border** (`--color-border` — `#e8e8e3`): Every card border, every input border, every divider. Hairline (`border`, never `border-2`).
- On card hover, lift to `border-neutral-300` for a one-step contrast change — never to a colored border.

### Ring (focus)
- **Ring** (`--color-ring` — `#ff595e`): Focus outline color. Standard pattern: `focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background`.

### Don't introduce new colors

The palette is intentionally narrow. If you find yourself reaching for amber, green, blue, or a second brand color, the right answer is almost always to reduce chrominance, not add another hue. Star ratings, success states, info banners, error states — all of these should resolve to primary red or neutral grayscale. The only exception is the testimonial avatar circles, which use soft pastel fills (`#ffd2c2`, `#ffe3a8`) as decorative variation; treat those as one-off swatches local to that component, not as tokens.

## Typography

Two families, loaded via `next/font/google` in [app/layout.tsx](app/layout.tsx):

- **Plus Jakarta Sans** (300–700) — exposed as `--font-sans`. The default for everything: body, UI, nav, buttons, headlines. Humanist sans with slightly rounder, more open apertures than Inter/Geist — reads warmer and less Silicon-Valley-default while staying neutral enough for dense UI text.
- **Fraunces** (variable, italic) — exposed as `--font-serif`. Used **only** as the inline `.font-serif italic` class on a single highlight word in headlines. Variable serif with the `SOFT` axis enabled — softer, more literary character than transitional serifs (PT Serif, Instrument Serif), pairs naturally with humanist sans.

The font CSS variables are wired through two layers: `next/font` defines `--font-sans-family` / `--font-serif-family` (the raw font stacks), and `@theme` in [globals.css](app/globals.css) re-exposes them as `--font-sans` / `--font-serif`. When swapping fonts later, change them in [app/layout.tsx](app/layout.tsx) — the indirection means `.font-serif` and the default body font come along automatically.

### Hierarchy

| Use | Tailwind classes |
|---|---|
| Hero headline | `text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05]` |
| Section heading (h2) | `text-3xl md:text-5xl font-semibold tracking-tight` |
| In-card / sub-section heading (h3) | `text-xl font-semibold tracking-tight` |
| Card title (small) | `text-lg font-semibold tracking-tight` |
| Body, regular | `text-base text-muted-foreground leading-relaxed` |
| Body, large (hero/section sub) | `text-lg md:text-xl text-muted-foreground leading-relaxed` |
| Caption / trust row | `text-sm text-muted-foreground` |
| Eyebrow (uppercase tracked) | `text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground` |
| In-article eyebrow (red) | `text-xs font-semibold uppercase tracking-[0.12em] text-primary` |

**Headline weight is always `font-semibold` (600), never `font-bold` (700).** Bold reads heavy against the bright canvas. Tracking-tight (`-0.02em` effectively) is mandatory on headlines — it pulls Inter's slightly-wide default tracking back to the modern feel the design needs.

### The serif-italic highlight word

This is the brand's signature typographic device. Examples currently in use:

- `Turn customer love into your <span class="font-serif italic text-primary">best</span> sales tool.`
- `Live in <span class="font-serif italic text-primary">five</span> minutes.`
- `Loved by <span class="font-serif italic text-primary">founders</span>.`
- `Ready to ship <span class="font-serif italic text-primary">social proof</span>?`
- `Pricing that <span class="font-serif italic text-primary">scales</span> with you.`
- `Make customers your <span class="font-serif italic text-primary">loudest fans</span>.`

**Rules:**

- Every section heading (h2) and the hero headline (h1) should contain exactly **one** serif-italic highlight. The highlight is the emotional/conceptual hook of the headline.
- Use 1–3 words inside the span. Don't italicize a whole phrase ("the best sales tool ever") — pick the word that carries the meaning.
- The highlight is always in `text-primary`. Don't make it black, don't make it `text-muted-foreground`, don't add a background.
- Add a trailing `pr-1` if a punctuation mark immediately follows the closing `</span>` and the italic descender visually collides with the period or question mark.
- Never use `font-serif italic` for anything *other* than the headline highlight — not body text, not buttons, not card content, not blockquotes (those use the `.prose-aboast` blockquote style, which is sans italic).

## Layout

### Page container

Every page in this app uses the same outer container:

```tsx
<div className="relative flex flex-col items-center pb-24 min-h-screen">
  <Nav />
  {/* sections */}
  <Footer />
</div>
```

`items-center` centers sections horizontally; each section component carries its own `w-full max-w-Xxl mx-auto px-6` so it can choose its own width.

The page is sitting on a fixed background wash (`.page-wash` in [globals.css](app/globals.css)) provided by the root layout — sections never need to add their own backgrounds.

### Max widths

| Use | Max width |
|---|---|
| Nav pill | `max-w-5xl` |
| Hero (centered text) | `max-w-4xl` |
| Section grid (features, process, testimonials, pricing) | `max-w-6xl` |
| CTA box, newsletter, trusted-by | `max-w-4xl` |
| Footer | `max-w-6xl` |
| Blog reading column | `max-w-3xl` |
| Blog featured / grid | `max-w-6xl` |

### Vertical rhythm

Sections are separated by **`mt-32`** (top margin on each section). Hero starts at `mt-16` (closer to the nav). Page padding bottom is `pb-24`. Footer adds its own `mt-32`. Don't introduce arbitrary section gaps — the predictable 32-unit gap is part of the rhythm.

Inside a section: `mb-6` between headline and subhead, `mb-10` to `mb-16` between the heading block and the content grid, `gap-6` for card grids, `gap-10` for the Process row.

### Horizontal padding

Every section uses `px-6` (24px) on its inner wrapper. Don't drop below this on mobile — the verdant pattern relies on consistent gutters at every breakpoint.

## Elevation

There are exactly **two** shadow recipes. Don't use Tailwind's `shadow-sm` / `shadow-md` / `shadow-lg`.

### Card shadow

```
shadow-[0_1px_2px_rgba(15,15,15,0.04),0_8px_24px_-12px_rgba(15,15,15,0.08)]
```

A 1px hairline shadow + a longer diffuse layer. Apply to every white card: feature cards, testimonial cards, blog post cards, pricing tier cards, the nav pill.

### Hero/CTA card shadow (more depth)

```
shadow-[0_1px_2px_rgba(15,15,15,0.04),0_24px_48px_-24px_rgba(15,15,15,0.16)]
```

For the boxed CTA section and the dark "Pro" pricing tier — pieces that should clearly float above the rest.

### Red glow (CTA + primary icon tiles)

```
shadow-[0_4px_24px_-6px_rgba(255,89,94,0.45)]
```

Hover state:

```
hover:shadow-[0_6px_28px_-4px_rgba(255,89,94,0.55)]
```

Apply to: every primary CTA button, the in-article CTA button, the in-card icon tile when it's a feature/hero icon (smaller intensity — `rgba(255,89,94,0.18)` for those).

### Hairlines on the CTA box

The boxed CTA and newsletter card both use top and bottom gradient hairlines:

```html
<div class="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
<div class="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
```

The top one is red-tinted (warmth), the bottom one is neutral (closes the card cleanly).

## Geometry

| Element | Radius |
|---|---|
| Buttons, badges, nav pill, input fields | `rounded-full` (pill) |
| Cards, post cards, in-article CTA | `rounded-3xl` (1.5rem) |
| Boxed CTA, newsletter card | `rounded-[2.5rem]` |
| Icon tiles inside cards (10×10) | `rounded-xl` |
| Larger icon tiles (16×16, 14×14) | `rounded-2xl` |
| Small source icons in feature visuals (8×8 / 9×9) | `rounded-lg` |

`--radius` is set to `1.5rem` so any `rounded-lg` Tailwind class that maps to `var(--radius)` becomes `rounded-3xl`. If you need a smaller radius, use bracket notation (`rounded-xl`, `rounded-2xl`).

## Components

### Button — [components/ui/button.tsx](components/ui/button.tsx)

Built with `class-variance-authority`. Variants:

- `default` — Primary red pill, white text, red glow shadow. The single highest-affordance element on every page.
- `secondary` — White pill, hairline border, hover lifts border to `neutral-300`. Used for "secondary action" pairs (e.g. "Start free" + "See pricing" in the CTA box).
- `ghost` — Transparent, hover-only neutral fill. Used for nav links and the mobile menu trigger.
- `link` — Inline-text primary red with underline on hover.

Sizes: `sm` (h-9), `default` (h-11), `lg` (h-13 with extra padding).

**One primary button per section.** Every section has at most one `variant="default"` button. Pairings use `default + secondary`, never two defaults.

### Card — [components/ui/card.tsx](components/ui/card.tsx)

White, rounded-3xl, hairline border, soft card shadow. Compose with `<CardHeader>`, `<CardTitle>`, `<CardDescription>`, `<CardContent>`. Most landing sections build cards inline (with the same recipe) rather than using these primitives — both are fine, but reach for the primitives when there's no per-section quirk.

### Badge — [components/ui/badge.tsx](components/ui/badge.tsx)

Pill, white/80 background with backdrop blur, hairline border. `withDot` prop adds a `bg-primary` dot with a soft halo — used for the hero "New" badge and the blog header chip. Always wrap with text inside, never a standalone dot.

### Nav — [components/nav.tsx](components/nav.tsx)

Floating glass pill, `sticky top-4 z-50`, `bg-white/75 backdrop-blur-md border border-border rounded-full`. The active link gets a `bg-primary` dot beneath it. Mobile collapses to a hamburger that opens a sheet below the pill — also rounded-3xl glass.

The active-link dot is computed from `usePathname()` — for hash links like `/#features`, the page itself is "active" when on `/`. This is the only place in the app where pathname logic lives.

### Footer — [components/footer.tsx](components/footer.tsx)

Minimal. A top hairline border, 4 columns of small links (Product / Resources / Company / Legal), and a final row with copyright + 3 social icons. No background fill — it continues the page canvas. No CTA in the footer (the CTA lives in its own boxed section above).

### Social icons — [components/social-icons.tsx](components/social-icons.tsx)

`XIcon`, `LinkedInIcon`, `GithubIcon`, `LinkIcon`. Inline SVGs because lucide-react removed brand icons. Use these wherever you need a brand mark — never reach for lucide for those.

## Section patterns

Every section on the landing page composes the same anatomy: an outer `<section className="w-full max-w-Xxl mx-auto mt-32 px-6">` wrapper, a centered heading block with a serif-italic highlight, and a grid or row of content below.

Section files live in [components/sections/](components/sections/). Feature-card visualizations live in [components/sections/feature-visuals/](components/sections/feature-visuals/) so the visual logic is separated from the card chrome.

The current set:

| Section | File | Pattern |
|---|---|---|
| Hero | [hero.tsx](components/sections/hero.tsx) | Badge → headline (with italic) → subhead → CTA → trust row |
| Features Grid | [features-grid.tsx](components/sections/features-grid.tsx) | 3-up white cards, each with icon tile + heading + body + a bespoke SVG visual filling the lower half. The three pillars: Collect / Organize / Show |
| Results | [results.tsx](components/sections/results.tsx) | 3-up white cards mirroring the Features Grid chrome but *inverted*: bespoke visual at the top, then a large `text-primary` stat (5–6xl), then a one-line label and a short context line. The "why social proof works" beat — uses widely-cited public stats |
| Process | [process.tsx](components/sections/process.tsx) | Centered heading → 3 circular icon containers connected by a gradient hairline; one is highlighted (primary-soft fill + red dot) |
| Surfaces | [surfaces.tsx](components/sections/surfaces.tsx) | Side-by-side layout — text column (heading with italic + subhead + 5-item checklist with primary-soft icon tiles) on the left, a SurfacesMosaic visual on the right showing the same testimonial in 5 different product contexts (browser / email / slide / pop-up / social), scattered with slight rotations like polaroids on a wall |
| Widget Showcase | [widget-showcase.tsx](components/sections/widget-showcase.tsx) | One CTABox-style card (rounded-[2.5rem], primary halo behind, top/bottom hairlines, deep shadow) split into a 2-column grid: **left column** is a continuous CSS vertical-marquee scrolling upward through 6 compact widget mockups (Wall / Carousel / Marquee / Rating badge / Featured / List) duplicated for seamless looping, masked with a top→bottom edge fade. **Right column** holds the heading (with serif italic), subhead, and a check-icon list of all widget styles. No JS — pure CSS animation, server-rendered |
| Pricing Mini | [pricing-mini.tsx](components/sections/pricing-mini.tsx) | 3-up cards, middle "Pro" tier inverted (dark `bg-foreground` text-white) with a primary-red CTA |
| CTA Box | [cta-box.tsx](components/sections/cta-box.tsx) | Single white card, rounded-[2.5rem], with top/bottom hairlines, large icon tile, headline with italic, two-button row |
| Trusted By | [trusted-by.tsx](components/sections/trusted-by.tsx) | Small uppercase eyebrow + 5 wordmark+icon lockups, grayscale → color on hover |

When adding a new section, copy the closest existing section file as the starting point. Don't invent a new wrapper recipe.

## Feature-card visuals

Sections that need visual reinforcement carry bespoke visualizations rather than screenshots. All live in [components/sections/feature-visuals/](components/sections/feature-visuals/).

**FeaturesGrid (the 3-up pillars):**

- **CollectNetwork** — Source icons on the left, dashed bezier curves converging to a central inbox/heart node in primary-soft.
- **CurateChart** — Mini area chart with a primary stroke, a small tooltip pill (accepts a `tooltip` prop, defaults to `"+32%"`), and a gradient fill from primary-tinted to transparent. **Shared visual** — also used on Results card 3 with `tooltip="2.7×"`.
- **DisplayRadar** — Concentric rings with orbiting dots, a center mini testimonial card (5 primary stars + short quote + tiny avatar) sitting inside a primary-tinted glow.

**Results (why proof converts):**

- **ProofDots** — A 2×5 grid of 10 small circles, 9 filled in primary-soft and 1 dashed-outline neutral. Visualizes "92%" in a way that lets the viewer count.
- **LiftBars** — Two bars side by side: a short neutral-200 "Before" bar and a tall primary-soft "After" bar with a small primary halo, capped with a primary arrow-up chip. Visualizes a conversion lift comparison without needing a chart.
- **CurateChart** (reused) — Same chart visual as FeaturesGrid card 2, with `tooltip="2.7×"`. Reusing the FeaturesGrid visual ties the "you can see your conversion lift inside the app" idea to the "social proof drives more signups" claim.

**Surfaces (where proof shows up):**

- **SurfacesMosaic** — A `relative h-[420px]` constellation of 5 absolute-positioned mini surface mockups, each showing the *same* testimonial ("Aboast saved my launch week" / Sarah J.) in a different surface context: a faux browser frame in the center, an email-client card top-left, a slide preview top-right, a notification pop-up bottom-left, and a social-post card bottom-right. Each rotated 3–5 degrees like polaroids on a wall, with soft shadows. The repetition of the same quote is the point — one testimonial, five surfaces.

These visuals are **the visual identity of their sections**. If you add a new card or section that needs a visual anchor, build a new bespoke visual — don't fall back to a product screenshot or a stock illustration. The pattern is "each card earns its own small system diagram" (FeaturesGrid, Results) or "each section earns its own small composition" (Surfaces).

When building a new visual, follow these conventions:
- Token palette only — `primary`, `primary-soft`, `border`, `neutral-{50,100,200,900}`, `foreground`, `muted-foreground`. Pastel avatar fills (`#ffd2c2`, `#ffe3a8`) are allowed as decorative one-off swatches local to a component.
- Mock browser frames, video players, code blocks, chat bubbles, and small mosaics are encouraged. Stock photos, real product screenshots, and decorative shapes are not.
- Keep tiny text legible — `text-[8px]` to `text-[10px]` for in-mockup type. Use `leading-snug` to keep mini-cards tight.
- Soft hairline shadows on overlapping cards (`shadow-[0_8px_24px_-12px_rgba(15,15,15,0.18)]`) sell the depth.

## Blog

### Index — [app/blog/page.tsx](app/blog/page.tsx)

Same outer container as the landing page. Header uses the hero pattern (badge → headline with italic → subhead). Featured post is a single full-width white card, two-column on md+ (cover image left, copy right). Remaining posts are a `md:grid-cols-2 lg:grid-cols-3 gap-6` of smaller cards. Newsletter is a `rounded-[2.5rem]` card with the same hairline-glow treatment as the home CTA.

### Post — [app/blog/[slug]/page.tsx](app/blog/[slug]/page.tsx)

Centered `max-w-3xl` reading column. Header is back link → date/time/author row → headline → excerpt → author block. Cover image is `max-w-4xl` (wider than the prose, signals "leading visual"). Body is `.prose-aboast`. In-article CTA is a small white card with hairline-glow and a serif-italic highlight in the headline. Footer nav is "All posts" + a 3-icon share row.

### Prose styles — `.prose-aboast` in [globals.css](app/globals.css)

- Body `1.125rem` / `1.75` line-height, color `#2a2a2a` (slightly softer than `--color-foreground` for long-form readability)
- Headings sans-serif, weight 600, tight tracking
- Links: `text-primary`, underline with 3px offset
- Blockquote: 3px left border in primary, italic body, no background
- `pre`: near-black background, white text, `rounded-2xl`
- Inline `code`: `primary-soft` background, `primary-hover` text, small horizontal padding, `rounded-md`

Don't reach for `@tailwindcss/typography` — `.prose-aboast` is tuned specifically against these tokens.

## Do's and don'ts

**Do:**
- Use exactly one serif-italic highlight per major headline.
- Use the page wash (handled by root layout) instead of section-level backgrounds.
- Reach for tokens (`text-primary`, `border-border`, `bg-card`) before hex.
- Compose new sections by copying an existing section file.
- Use lucide-react icons with `strokeWidth={1.75}` (verdant's stroke weight). For accent icons inside primary tiles, lighter strokes (`1.5`) look better.
- Use `rounded-full` for buttons + inputs, `rounded-3xl` for cards.
- Pair red CTAs with a soft red glow shadow.

**Don't:**
- Don't introduce a second brand color. If you need to differentiate, do it with type weight, size, or position — not hue.
- Don't use `font-bold` on headlines. Always `font-semibold`.
- Don't put `font-serif italic` on body text, blockquotes, captions, or buttons.
- Don't use Tailwind's `shadow-sm`/`shadow-md`/`shadow-lg`. Use the two recipes above.
- Don't add background fill to footers/sections — they continue the page canvas.
- Don't add a CTA inside the footer. The CTA lives in the boxed `CTABox` section above the footer.
- Don't reach for lucide for brand icons (Twitter/X, LinkedIn, GitHub). Use [components/social-icons.tsx](components/social-icons.tsx).
- Don't use neutral-colored glow shadows. A glow is always primary red.
- Don't break the `mt-32` section rhythm by introducing custom section gaps.
- Don't use product screenshots as the visual identity of feature cards — use bespoke per-card SVG visualizations (see CollectNetwork, CurateChart, DisplayRadar).

## When extending the system

If you need a new pattern not covered here:

1. First check whether an existing section can carry it. Most new requirements (a new "stats" row, a new comparison) can be expressed with the existing card + grid recipes.
2. If you need new tokens, add them to `@theme` in [globals.css](app/globals.css) — don't introduce inline hex values in components.
3. If you add a new shadow recipe, justify why the two existing recipes don't cover it.
4. Run `npm run build` after substantive changes — TypeScript catches most regressions and the static prerender catches anything that breaks on the server side.
5. Walk every section in browser at 1440 / 1280 / 768 / 390 to confirm spacing and the serif-italic highlight word still fits within the line.

If you're about to add anything that would push beyond this document, stop and ask first — drift from this system is the single fastest way for the surface to feel "less designed."
