"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Settings,
  Upload,
  Sparkles,
  CreditCard,
} from "lucide-react";
import { SidebarProfile } from "./SidebarProfile";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { cn } from "@/lib/utils";
import { useUserPlan, quotaUsageRatio } from "@/lib/use-user-plan";

export function Sidebar() {
  const pathname = usePathname();
  const { data } = useUserPlan();

  // All nav paths so we can prefer the most specific match — without this,
  // visiting /dashboard/testimonials/import lights up both "Testimonials"
  // (because it startsWith) AND "Import".
  const NAV_PATHS = [
    "/dashboard",
    "/dashboard/forms",
    "/dashboard/testimonials/import",
    "/dashboard/testimonials",
    "/dashboard/studio",
    "/dashboard/billing",
    "/dashboard/settings",
  ];

  const isActive = (path: string) => {
    if (pathname === path) return true;
    if (!pathname.startsWith(path + "/")) return false;
    return !NAV_PATHS.some(
      (other) =>
        other !== path &&
        other.startsWith(path + "/") &&
        (pathname === other || pathname.startsWith(other + "/"))
    );
  };

  const navLinkClass = (path: string) => {
    const active = isActive(path);
    return cn(
      "relative flex items-center gap-3 px-3 py-2 rounded-xl transition-colors text-[14px]",
      active
        ? "bg-primary-soft text-primary font-medium"
        : "text-muted-foreground hover:bg-neutral-100 hover:text-foreground"
    );
  };

  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <p className="px-3 pt-2 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
      {children}
    </p>
  );

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-border flex flex-col">
      <div className="border-b border-border p-3">
        <WorkspaceSwitcher />
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col overflow-y-auto">
        <div className="space-y-5">
          <div>
            <Link href="/dashboard" className={navLinkClass("/dashboard")}>
              <LayoutDashboard className="h-4 w-4" strokeWidth={1.75} />
              <span>Dashboard</span>
            </Link>
          </div>

          <div className="space-y-0.5">
            <SectionLabel>Collect</SectionLabel>
            <Link href="/dashboard/forms" className={navLinkClass("/dashboard/forms")}>
              <FileText className="h-4 w-4" strokeWidth={1.75} />
              <span>Forms</span>
            </Link>
            <Link href="/dashboard/testimonials/import" className={navLinkClass("/dashboard/testimonials/import")}>
              <Upload className="h-4 w-4" strokeWidth={1.75} />
              <span>Import</span>
            </Link>
          </div>

          <div className="space-y-0.5">
            <SectionLabel>Manage</SectionLabel>
            <Link href="/dashboard/testimonials" className={navLinkClass("/dashboard/testimonials")}>
              <MessageSquare className="h-4 w-4" strokeWidth={1.75} />
              <span>Testimonials</span>
            </Link>
          </div>

          <div className="space-y-0.5">
            <SectionLabel>Share</SectionLabel>
            <Link href="/dashboard/studio" className={navLinkClass("/dashboard/studio")}>
              <Sparkles className="h-4 w-4" strokeWidth={1.75} />
              <span>Studio</span>
            </Link>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-border space-y-1">
          {/* Plan + usage tile — soft nudge before the Billing link */}
          {data && (
            <PlanUsageTile
              plan={data.plan}
              testimonialsRatio={quotaUsageRatio(data, "testimonials")}
              testimonialsUsed={data.usage.testimonials}
              testimonialsLimit={data.limits.testimonials}
            />
          )}
          <Link
            href="/dashboard/billing"
            className={navLinkClass("/dashboard/billing")}
          >
            <CreditCard className="h-4 w-4" strokeWidth={1.75} />
            <span>Billing</span>
            {data && (
              <span
                className={`ml-auto text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                  data.plan === "PRO"
                    ? "bg-primary-soft text-primary"
                    : "bg-neutral-100 text-muted-foreground"
                }`}
              >
                {data.plan}
              </span>
            )}
          </Link>
          <Link href="/dashboard/settings" className={navLinkClass("/dashboard/settings")}>
            <Settings className="h-4 w-4" strokeWidth={1.75} />
            <span>Settings</span>
          </Link>
          <SidebarProfile />
        </div>
      </nav>
    </aside>
  );
}

function PlanUsageTile({
  plan,
  testimonialsRatio,
  testimonialsUsed,
  testimonialsLimit,
}: {
  plan: "FREE" | "PRO";
  testimonialsRatio: number;
  testimonialsUsed: number;
  testimonialsLimit: number;
}) {
  // Only show on Free, and only when ≥75% of any tracked quota — otherwise
  // it's just noise.
  if (plan === "PRO") return null;
  if (testimonialsRatio < 0.75) return null;
  const isAt = testimonialsRatio >= 1;

  return (
    <Link
      href="/dashboard/billing"
      className={cn(
        "block px-3 py-2.5 rounded-xl border text-[12px] mb-1 transition-colors",
        isAt
          ? "bg-primary-soft/40 border-primary/30 hover:bg-primary-soft/60"
          : "bg-amber-50 border-amber-200 hover:bg-amber-100"
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-foreground">
          {isAt ? "Limit reached" : "Approaching limit"}
        </span>
        <span className="tabular-nums text-muted-foreground">
          {testimonialsUsed}/{testimonialsLimit}
        </span>
      </div>
      <p className="text-muted-foreground leading-snug">
        Testimonials in this workspace. Tap to upgrade.
      </p>
    </Link>
  );
}
