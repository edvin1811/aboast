"use client";

import { useState } from "react";
import { useUserPlan } from "@/lib/use-user-plan";
import { Button } from "@/components/ui/button";
import { PageBanner } from "../../components/PageBanner";
import { Check, ExternalLink, Sparkles } from "lucide-react";
import { PRO_PRICE_USD } from "@/lib/plans";

export default function BillingPage() {
  const { data, isLoading } = useUserPlan();
  const [loading, setLoading] = useState<"upgrade" | "portal" | null>(null);

  if (isLoading || !data) {
    return (
      <div className="space-y-12">
        <PageBanner
          eyebrow="Account"
          title={
            <>
              Plan &amp; <span className="font-serif italic text-primary">billing</span>
            </>
          }
          description="Manage your subscription and see what's included on each plan."
        />
        <div className="h-64 rounded-2xl bg-white border border-border animate-pulse" />
      </div>
    );
  }

  const isPro = data.plan === "PRO";

  const onUpgrade = async () => {
    setLoading("upgrade");
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body?.error ?? "Could not start checkout.");
        setLoading(null);
        return;
      }
      const { url } = await res.json();
      if (url) window.location.href = url;
      else setLoading(null);
    } catch {
      setLoading(null);
    }
  };

  const onPortal = async () => {
    setLoading("portal");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body?.error ?? "Could not open billing portal.");
        setLoading(null);
        return;
      }
      const { url } = await res.json();
      if (url) window.location.href = url;
      else setLoading(null);
    } catch {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-12">
      <PageBanner
        eyebrow="Account"
        title={
          <>
            Plan &amp; <span className="font-serif italic text-primary">billing</span>
          </>
        }
        description="Manage your subscription and see what's included on each plan."
      />

      {/* Current plan card */}
      <section className="bg-white border border-border rounded-2xl p-7 shadow-[0_1px_2px_rgba(15,15,15,0.04),0_8px_24px_-12px_rgba(15,15,15,0.08)]">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-2">
              Current plan
            </p>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                {isPro ? "Pro" : "Free"}
              </h2>
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                  isPro
                    ? "bg-primary-soft text-primary border border-primary/20"
                    : "bg-neutral-100 text-foreground border border-border"
                }`}
              >
                {isPro ? "Active" : "Free forever"}
              </span>
            </div>
            {isPro && data.currentPeriodEnd && (
              <p className="text-sm text-muted-foreground mt-2">
                Renews{" "}
                {new Date(data.currentPeriodEnd).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isPro ? (
              <Button onClick={onPortal} disabled={loading !== null}>
                <ExternalLink className="h-4 w-4 mr-1.5" strokeWidth={1.75} />
                {loading === "portal" ? "Opening…" : "Manage subscription"}
              </Button>
            ) : (
              <Button onClick={onUpgrade} disabled={loading !== null}>
                <Sparkles className="h-4 w-4 mr-1.5" strokeWidth={2} />
                {loading === "upgrade" ? "Loading…" : `Upgrade — $${PRO_PRICE_USD}/mo`}
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Usage */}
      <section className="space-y-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Your usage
          </p>
          <h3 className="text-xl font-semibold tracking-tight text-foreground mt-1">
            {isPro
              ? "You're on the unlimited tier"
              : "Free tier limits — across your current workspace"}
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <UsageTile
            label="Workspaces"
            current={data.usage.workspaces}
            limit={data.limits.workspaces}
            isPro={isPro}
          />
          <UsageTile
            label="Forms"
            current={data.usage.forms}
            limit={data.limits.forms}
            isPro={isPro}
          />
          <UsageTile
            label="Widgets"
            current={data.usage.widgets}
            limit={data.limits.widgets}
            isPro={isPro}
          />
          <UsageTile
            label="Walls"
            current={data.usage.walls}
            limit={data.limits.walls}
            isPro={isPro}
          />
          <UsageTile
            label="Testimonials"
            current={data.usage.testimonials}
            limit={data.limits.testimonials}
            isPro={isPro}
          />
        </div>
      </section>

      {/* Plan comparison */}
      <section className="grid md:grid-cols-2 gap-5">
        <PlanCard
          name="Free"
          price="$0"
          tagline="Start collecting today"
          active={!isPro}
          features={[
            "1 workspace",
            "1 form, 1 widget, 1 wall",
            "20 testimonials per workspace",
            'Includes "Powered by aboast" watermark',
          ]}
        />
        <PlanCard
          name="Pro"
          price={`$${PRO_PRICE_USD}`}
          priceSuffix="/month"
          tagline="For founders shipping social proof"
          active={isPro}
          accent
          features={[
            "3 workspaces",
            "Unlimited forms, widgets, and walls",
            "Unlimited testimonials per workspace",
            "No watermark on any surface",
            "Video testimonials, CSV export, custom domains",
          ]}
          cta={
            isPro ? (
              <Button onClick={onPortal} disabled={loading !== null} className="w-full">
                Manage subscription
              </Button>
            ) : (
              <Button onClick={onUpgrade} disabled={loading !== null} className="w-full">
                {loading === "upgrade" ? "Loading…" : `Upgrade — $${PRO_PRICE_USD}/mo`}
              </Button>
            )
          }
        />
      </section>
    </div>
  );
}

function UsageTile({
  label,
  current,
  limit,
  isPro,
}: {
  label: string;
  current: number;
  limit: number;
  isPro: boolean;
}) {
  const unlimited = !Number.isFinite(limit);
  const ratio = unlimited || limit === 0 ? 0 : current / limit;
  const isNear = ratio >= 0.8 && !unlimited;
  const isAt = ratio >= 1 && !unlimited;

  return (
    <div
      className={`bg-white border rounded-xl p-4 ${
        isAt
          ? "border-primary/40 shadow-[0_0_0_3px_rgba(255,89,94,0.08)]"
          : "border-border"
      }`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
        {label}
      </p>
      <p className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
        {current.toLocaleString()}
        {!unlimited && (
          <span className="text-sm text-muted-foreground font-normal">
            {" "}
            / {limit}
          </span>
        )}
        {unlimited && (
          <span className="text-sm text-muted-foreground font-normal"> / ∞</span>
        )}
      </p>
      {!unlimited && (
        <div className="mt-3 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isAt
                ? "bg-primary"
                : isNear
                  ? "bg-amber-500"
                  : "bg-foreground/60"
            }`}
            style={{ width: `${Math.min(100, Math.round(ratio * 100))}%` }}
          />
        </div>
      )}
      {unlimited && (
        <p className="text-[11px] text-emerald-700 font-medium mt-1.5">
          Unlimited on Pro
        </p>
      )}
    </div>
  );
}

function PlanCard({
  name,
  price,
  priceSuffix,
  tagline,
  features,
  active,
  accent,
  cta,
}: {
  name: string;
  price: string;
  priceSuffix?: string;
  tagline: string;
  features: string[];
  active?: boolean;
  accent?: boolean;
  cta?: React.ReactNode;
}) {
  return (
    <div
      className={`relative bg-white border rounded-2xl p-7 shadow-[0_1px_2px_rgba(15,15,15,0.04),0_8px_24px_-12px_rgba(15,15,15,0.08)] ${
        accent ? "border-primary/30" : "border-border"
      }`}
    >
      {active && (
        <span className="absolute top-5 right-5 text-[10px] font-semibold uppercase tracking-wider bg-foreground text-background px-2 py-1 rounded-full">
          Your plan
        </span>
      )}
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {name}
      </p>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-4xl font-semibold tracking-tight text-foreground tabular-nums">
          {price}
        </span>
        {priceSuffix && (
          <span className="text-sm text-muted-foreground">{priceSuffix}</span>
        )}
      </div>
      <p className="text-sm text-muted-foreground mt-1.5">{tagline}</p>
      <ul className="mt-5 space-y-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm">
            <span
              className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                accent
                  ? "bg-primary-soft text-primary"
                  : "bg-neutral-100 text-foreground"
              }`}
            >
              <Check className="h-3 w-3" strokeWidth={2.5} />
            </span>
            <span className="text-foreground">{f}</span>
          </li>
        ))}
      </ul>
      {cta && <div className="mt-6">{cta}</div>}
    </div>
  );
}
