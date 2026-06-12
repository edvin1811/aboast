"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, X } from "lucide-react";
import { PRO_PRICE_USD } from "@/lib/plans";
import {
  useUpgradeDialog,
  type UpgradeResource,
  type UpgradeKind,
} from "@/lib/use-upgrade-dialog";

/**
 * The shared paywall dialog. Mounted once at the dashboard layout level —
 * any client component can open it via `useUpgradeDialog().showUpgrade(...)`.
 *
 * Copy is derived from { kind, resource } so the same component covers every
 * paywall surface in the app.
 */
export function UpgradeDialog() {
  const { state, closeUpgrade } = useUpgradeDialog();
  const [loading, setLoading] = useState(false);

  if (!state) return null;

  const { headline, description } = copyFor(state);

  const onUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body?.error ?? "Could not start checkout. Please try again.");
        setLoading(false);
        return;
      }
      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error("Stripe checkout failed", err);
      setLoading(false);
    }
  };

  return (
    <Dialog open={state.open} onOpenChange={(o) => !o && closeUpgrade()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        {/* Hero strip */}
        <div className="relative px-6 pt-7 pb-5 bg-gradient-to-br from-primary-soft via-white to-white border-b border-border">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary bg-primary-soft border border-primary/20 rounded-full px-2.5 py-1">
            <Sparkles className="h-3 w-3" strokeWidth={2} />
            Pro
          </span>
          <DialogHeader className="mt-3 text-left space-y-1.5">
            <DialogTitle className="text-2xl font-semibold tracking-tight text-foreground">
              {headline}
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Pro benefits */}
        <div className="px-6 py-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-3">
            What you get on Pro
          </p>
          <ul className="space-y-2">
            <Benefit text="3 workspaces (up from 1)" />
            <Benefit text="Unlimited forms, widgets, and walls" />
            <Benefit text="Unlimited testimonials per workspace" />
            <Benefit text='No "Powered by aboast" watermark' />
            <Benefit text="Video testimonials, custom domains, CSV export" />
          </ul>
        </div>

        {/* Footer / CTA */}
        <div className="px-6 pb-6 flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-semibold tracking-tight text-foreground tabular-nums">
              ${PRO_PRICE_USD}
            </span>
            <span className="text-sm text-muted-foreground">/month</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => closeUpgrade()}
              disabled={loading}
            >
              Not now
            </Button>
            <Button onClick={onUpgrade} disabled={loading}>
              {loading ? "Loading…" : "Upgrade to Pro"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Benefit({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2.5 text-sm">
      <span className="h-5 w-5 rounded-full bg-primary-soft text-primary flex items-center justify-center shrink-0 mt-0.5">
        <Check className="h-3 w-3" strokeWidth={2.5} />
      </span>
      <span className="text-foreground">{text}</span>
    </li>
  );
}

function copyFor(state: {
  kind: UpgradeKind;
  resource: UpgradeResource;
  current?: number;
  limit?: number;
  customMessage?: string;
}): { headline: string; description: string } {
  if (state.customMessage) {
    return { headline: state.customMessage, description: "Upgrade to Pro to continue." };
  }

  if (state.kind === "quota_reached") {
    switch (state.resource) {
      case "workspace":
        return {
          headline: "You're at your workspace limit",
          description:
            "Free users can have 1 workspace. Upgrade to Pro for up to 3.",
        };
      case "form":
        return {
          headline: "You've reached the form limit",
          description:
            "Free users get 1 form per workspace. Pro gives you unlimited forms.",
        };
      case "widget":
        return {
          headline: "You've reached the widget limit",
          description:
            "Free users get 1 widget per workspace. Pro gives you unlimited widgets.",
        };
      case "wall":
        return {
          headline: "You've reached the wall limit",
          description:
            "Free users get 1 Wall of Love per workspace. Pro gives you unlimited walls.",
        };
      case "testimonial":
        return {
          headline:
            state.current && state.limit
              ? `You've used all ${state.limit} testimonial slots`
              : "You've hit the testimonial limit",
          description:
            "Free workspaces are capped at 20 testimonials. Pro is unlimited.",
        };
      case "import":
        return {
          headline: "This import would exceed your free testimonial limit",
          description:
            state.current && state.limit
              ? `Importing would put you at ${state.current} / ${state.limit}. Pro removes the cap.`
              : "Pro gives you unlimited testimonials.",
        };
    }
  }

  // premium_feature
  switch (state.resource) {
    case "branding":
      return {
        headline: 'Remove "Powered by aboast" with Pro',
        description:
          "On Pro, the watermark disappears from every form, widget, and Wall of Love.",
      };
    case "video":
      return {
        headline: "Video testimonials are a Pro feature",
        description:
          "Let customers record video testimonials on any of your forms.",
      };
    case "export":
      return {
        headline: "Exporting is a Pro feature",
        description: "Download your testimonials as a CSV anytime.",
      };
    case "custom_domain":
      return {
        headline: "Custom domains are a Pro feature",
        description:
          "Serve your wall pages from your own subdomain instead of aboast.com.",
      };
    case "vanity_slug":
      return {
        headline: "Custom share URLs are a Pro feature",
        description: "Pick the slug your form, widget, or wall lives at.",
      };
    default:
      return {
        headline: "This is a Pro feature",
        description: "Upgrade to unlock it.",
      };
  }
}
