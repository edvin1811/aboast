"use client";

import { UserButton, useUser } from "@clerk/nextjs";

export function SidebarProfile() {
  const { user } = useUser();

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-100 transition-colors">
      <UserButton />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground truncate">
          {user?.firstName || user?.emailAddresses?.[0]?.emailAddress || "User"}
        </div>
        <div className="text-xs text-muted-foreground truncate">Personal account</div>
      </div>
    </div>
  );
}
