"use client";

import { motion } from "framer-motion";
import { LucideIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Compact, animated "tool is running" pill — the default loading affordance
 * for tools without a bespoke skeleton. Replaces the old static
 * "Using {toolName}" chip with a polished shimmer + spinner.
 */
export function ToolStatusPill({
  label,
  icon: Icon = Loader2,
  className,
}: {
  label: string;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative inline-flex w-fit items-center gap-2 overflow-hidden rounded-full border border-border bg-muted/60 py-1.5 pl-2.5 pr-3 text-xs font-medium text-muted-foreground",
        className,
      )}
    >
      <Icon className="size-3.5 animate-spin text-foreground/70" />
      <span className="relative z-10">{label}</span>
      {/* shimmer sweep */}
      <motion.span
        aria-hidden
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-foreground/[0.07] to-transparent"
        animate={{ translateX: ["-100%", "200%"] }}
        transition={{
          duration: 1.6,
          repeat: Infinity,
          ease: "linear",
          repeatDelay: 0.4,
        }}
      />
    </motion.div>
  );
}

export default ToolStatusPill;
