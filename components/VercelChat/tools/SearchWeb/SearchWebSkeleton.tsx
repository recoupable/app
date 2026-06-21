"use client";

import React from "react";
import { motion } from "framer-motion";
import { Globe } from "lucide-react";

const SearchWebSkeleton: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex size-9 shrink-0 animate-pulse items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <Globe className="size-[18px] opacity-60" />
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <span className="text-sm font-medium text-muted-foreground">
            Searching the web…
          </span>
          <div className="h-3 w-28 animate-pulse rounded-md bg-muted/70" />
        </div>
      </div>

      <div className="space-y-2 border-t border-border/60 p-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="size-6 shrink-0 animate-pulse rounded-md bg-muted" />
            <div className="flex-1 space-y-1.5">
              <div className="h-2.5 w-24 animate-pulse rounded-md bg-muted/70" />
              <div className="h-3 w-2/3 animate-pulse rounded-md bg-muted" />
              <div className="h-2.5 w-full animate-pulse rounded-md bg-muted/70" />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default SearchWebSkeleton;
