"use client";

import React from "react";
import { motion } from "framer-motion";
import { DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toolCardMotion } from "../shared/toolCardTokens";

export default function YouTubeRevenueSkeleton() {
  return (
    <motion.div
      initial={toolCardMotion.initial}
      animate={toolCardMotion.animate}
      transition={toolCardMotion.transition}
      className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      {/* Header mirrors ToolCard */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex size-9 shrink-0 animate-pulse items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <DollarSign className="size-[18px]" />
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      <div className="space-y-5 border-t border-border/60 p-3">
        {/* Stat chips */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-muted/40 p-4"
            >
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-7 w-20" />
              <Skeleton className="mt-1.5 h-3 w-16" />
            </div>
          ))}
        </div>

        {/* Date range */}
        <div className="flex items-center justify-between border-t border-border/60 pt-3">
          <Skeleton className="h-3.5 w-40" />
          <Skeleton className="h-3.5 w-24" />
        </div>

        {/* Daily breakdown bars */}
        <div className="space-y-1.5">
          <Skeleton className="mb-3 h-4 w-48" />
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-3.5 w-16 shrink-0" />
              <Skeleton className="h-6 flex-1 rounded-md" />
              <Skeleton className="h-3.5 w-16 shrink-0" />
            </div>
          ))}
        </div>

        {/* Footer note */}
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </motion.div>
  );
}
