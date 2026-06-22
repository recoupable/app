"use client";

import { motion } from "framer-motion";
import { Users } from "lucide-react";

/** A muted block carrying a left-to-right shimmer sweep. */
const Shimmer = ({
  className = "",
  delay = 0,
}: {
  className?: string;
  delay?: number;
}) => (
  <div className={`relative overflow-hidden bg-muted/70 ${className}`}>
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
  </div>
);

/**
 * Mirrors GetArtistSocialsResult: a ToolCard header + a 2/3/4-col grid of
 * placeholder tiles (not a row list), so resolving to the result has no
 * layout jump.
 */
const GetArtistSocialsSkeleton = ({ title }: { title?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
          <Users className="size-[18px] opacity-70" />
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <span className="text-sm font-medium text-muted-foreground">
            {title ?? "Getting artist socials…"}
          </span>
          <Shimmer className="h-3 w-32 rounded-md" />
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
                <Shimmer
                  className="size-7 shrink-0 rounded-lg"
                  delay={i * 0.1}
                />
                <Shimmer className="h-3 w-16 rounded-md" delay={i * 0.1} />
              </div>
              <Shimmer className="h-2.5 w-20 rounded-md" delay={i * 0.1} />
              <Shimmer className="h-2.5 w-12 rounded-md" delay={i * 0.1} />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default GetArtistSocialsSkeleton;
