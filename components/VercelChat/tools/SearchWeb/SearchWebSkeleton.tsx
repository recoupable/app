"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Globe } from "lucide-react";

/** A muted block that wears a left-to-right shimmer sweep instead of a bare pulse. */
const Shimmer: React.FC<{ className?: string; delay?: number }> = ({
  className = "",
  delay = 0,
}) => {
  const reduce = useReducedMotion();
  return (
    <div className={`relative overflow-hidden bg-muted/70 ${className}`}>
      {reduce ? null : (
        <motion.div
          aria-hidden
          className="absolute inset-y-0 -left-full w-full bg-gradient-to-r from-transparent via-foreground/10 to-transparent"
          animate={{ x: ["0%", "300%"] }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay,
          }}
        />
      )}
    </div>
  );
};

const SearchWebSkeleton: React.FC = () => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.28 }}
      className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <Globe className="size-[18px] opacity-70" />
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <span className="text-sm font-medium text-muted-foreground">
            Searching the web…
          </span>
          <Shimmer className="h-3 w-28 rounded-md" />
        </div>
      </div>

      {/* Thin indeterminate scanning bar to signal active work. */}
      <div className="relative h-0.5 w-full overflow-hidden bg-blue-500/10">
        {reduce ? null : (
          <motion.div
            aria-hidden
            className="absolute inset-y-0 w-1/3 rounded-full bg-blue-500/50"
            animate={{ x: ["-100%", "300%"] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </div>

      <div className="space-y-2 border-t border-border/60 p-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <Shimmer className="size-6 shrink-0 rounded-md" delay={i * 0.12} />
            <div className="flex-1 space-y-1.5">
              <Shimmer className="h-2.5 w-24 rounded-md" delay={i * 0.12} />
              <Shimmer className="h-3 w-2/3 rounded-md" delay={i * 0.12} />
              <Shimmer
                className="h-2.5 w-full rounded-md"
                delay={i * 0.12}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default SearchWebSkeleton;
