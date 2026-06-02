import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  children,
  withDot = false,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { withDot?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-white/80 backdrop-blur-sm text-xs text-muted-foreground",
        className
      )}
      {...props}
    >
      {withDot && (
        <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(255,89,94,0.6)]" />
      )}
      {children}
    </span>
  );
}
