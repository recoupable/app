"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import PulseToggleSkeleton from "@/components/Pulse/PulseToggleSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { toolCardMotion } from "../shared/toolCardTokens";

export default function PulseToolSkeleton() {
  return (
    <motion.div
      initial={toolCardMotion.initial}
      animate={toolCardMotion.animate}
      transition={toolCardMotion.transition}
      className="w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex size-9 shrink-0 animate-pulse items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Activity className="size-[18px]" />
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <div className="border-t border-border/60 p-3">
        <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2.5">
          <Skeleton className="h-4 w-32" />
          <PulseToggleSkeleton />
        </div>
      </div>
    </motion.div>
  );
}
