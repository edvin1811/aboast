import { ReactNode } from "react";

interface PageBannerProps {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  action?: ReactNode;
}

/**
 * Standard dashboard page header.
 * Matches the marketing design language: small uppercase eyebrow + a large
 * `font-semibold tracking-tight` headline (the highlight word inside should be
 * `<span className="font-serif italic text-primary">…</span>`) + a muted subhead.
 * No backgrounds, no decorative blobs — sits flush against the page surface.
 */
export function PageBanner({ eyebrow, title, description, action }: PageBannerProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div className="space-y-2 max-w-2xl">
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground leading-[1.1]">
          {title}
        </h1>
        {description && (
          <p className="text-base text-muted-foreground leading-relaxed">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
