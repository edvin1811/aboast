"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquare, FileText, Settings, Upload, Sparkles } from "lucide-react";
import { SidebarProfile } from "./SidebarProfile";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(path);
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
