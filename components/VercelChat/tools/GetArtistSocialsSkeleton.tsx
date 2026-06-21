"use client";

import { motion } from "framer-motion";
import { Users } from "lucide-react";

const GetArtistSocialsSkeleton = ({ title }: { title?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex size-9 shrink-0 animate-pulse items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
          <Users className="size-[18px] opacity-60" />
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <span className="text-sm font-medium text-muted-foreground">
            {title ?? "Getting artist socials…"}
          </span>
          <div className="h-3 w-24 animate-pulse rounded-md bg-muted/70" />
        </div>
      </div>

      <div className="border-t border-border/60 p-3">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3"
            >
              <div className="flex items-center gap-2">
                <div className="size-7 shrink-0 animate-pulse rounded-lg bg-muted" />
                <div className="h-3.5 w-16 animate-pulse rounded-md bg-muted" />
              </div>
              <div className="h-3 w-20 animate-pulse rounded-md bg-muted/70" />
              <div className="h-3 w-12 animate-pulse rounded-md bg-muted/70" />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default GetArtistSocialsSkeleton;
