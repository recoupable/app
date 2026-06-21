"use client";

import { motion } from "framer-motion";
import { Video, Play } from "lucide-react";
import { toolCardMotion } from "../shared/toolCardTokens";

export function Sora2VideoSkeleton() {
  return (
    <motion.div
      initial={toolCardMotion.initial}
      animate={toolCardMotion.animate}
      transition={toolCardMotion.transition}
      className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex size-9 shrink-0 animate-pulse items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
          <Video className="size-[18px]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">
            Generating video…
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Rendering with Sora 2 — this can take a moment
          </p>
        </div>
      </div>
      <div className="border-t border-border/60 p-3">
        <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl bg-muted">
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-muted via-muted/60 to-muted" />
          <div className="relative flex size-12 items-center justify-center rounded-full bg-background/60 text-muted-foreground/60 backdrop-blur-sm">
            <Play className="size-5 translate-x-0.5" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Sora2VideoSkeleton;
