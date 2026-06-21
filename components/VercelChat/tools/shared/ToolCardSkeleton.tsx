"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Skeleton shell that mirrors ToolCard's anatomy so the loading → loaded
 * transition has no layout jump. Pass `rows` to preview list-style results.
 */
export function ToolCardSkeleton({
  icon: Icon,
  label,
  rows = 3,
  className,
}: {
  icon?: LucideIcon;
  /** Optional label shown next to the pulsing chip while loading. */
  label?: string;
  rows?: number;
  className?: string;
}) {
  const safeRows = Math.max(0, rows);
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className={cn(
        "w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-sm",
        className,
      )}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex size-9 shrink-0 animate-pulse items-center justify-center rounded-xl bg-muted text-muted-foreground">
          {Icon ? <Icon className="size-[18px] opacity-50" /> : null}
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          {label ? (
            <span className="text-sm font-medium text-muted-foreground">
              {label}
            </span>
          ) : (
            <div className="h-3.5 w-28 animate-pulse rounded-md bg-muted" />
          )}
          <div className="h-3 w-20 animate-pulse rounded-md bg-muted/70" />
        </div>
      </div>
      {safeRows > 0 ? (
        <div className="space-y-2 border-t border-border/60 p-3">
          {Array.from({ length: safeRows }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="size-8 shrink-0 animate-pulse rounded-lg bg-muted" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-1/2 animate-pulse rounded-md bg-muted" />
                <div className="h-2.5 w-1/3 animate-pulse rounded-md bg-muted/70" />
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </motion.div>
  );
}

export default ToolCardSkeleton;
