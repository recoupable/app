"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Video, Play } from "lucide-react";
import { toolCardMotion } from "../shared/toolCardTokens";

const STAGES = [
  "Rendering with Sora 2 — this can take a moment",
  "Rendering frames…",
  "Compositing scenes…",
  "Almost there…",
];

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s.toString().padStart(2, "0")}s` : `${s}s`;
}

export function Sora2VideoSkeleton() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Advance staged copy as the wait grows (multi-minute renders).
  const stageIndex = Math.min(Math.floor(elapsed / 15), STAGES.length - 1);

  return (
    <motion.div
      initial={toolCardMotion.initial}
      animate={toolCardMotion.animate}
      transition={toolCardMotion.transition}
      className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
          <Video className="size-[18px]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">
            Generating video…
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {STAGES[stageIndex]}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium tabular-nums text-muted-foreground">
          {formatElapsed(elapsed)}
        </span>
      </div>
      <div className="border-t border-border/60 p-3">
        <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl bg-muted">
          <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/60 to-muted" />
          {/* Diagonal shimmer sweep */}
          <motion.div
            aria-hidden
            className="absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-foreground/10 to-transparent"
            initial={{ x: 0 }}
            animate={{ x: ["0%", "450%"] }}
            transition={{ duration: 1.8, ease: "easeInOut", repeat: Infinity }}
          />
          <motion.div
            className="relative flex size-12 items-center justify-center rounded-full bg-background/60 text-muted-foreground/60 backdrop-blur-sm"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
          >
            <Play className="size-5 translate-x-0.5" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default Sora2VideoSkeleton;
