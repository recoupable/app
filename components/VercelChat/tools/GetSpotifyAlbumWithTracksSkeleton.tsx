"use client";

import { motion } from "framer-motion";
import { toolCardMotion } from "./shared/toolCardTokens";

const GetSpotifyAlbumWithTracksSkeleton = () => {
  return (
    <motion.div
      initial={toolCardMotion.initial}
      animate={toolCardMotion.animate}
      transition={toolCardMotion.transition}
      className="my-4 w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      {/* Hero Section Skeleton — mirrors the resolved immersive hero */}
      <div className="relative bg-gradient-to-b from-zinc-800 to-zinc-950 p-4 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
          {/* Album Cover */}
          <div className="size-32 shrink-0 animate-pulse rounded-xl bg-white/10 sm:size-48" />

          {/* Album Info */}
          <div className="min-w-0 flex-1 space-y-3">
            <div className="h-5 w-16 animate-pulse rounded-full bg-white/15" />
            <div className="h-9 w-3/4 animate-pulse rounded-lg bg-white/15" />
            <div className="h-5 w-1/2 animate-pulse rounded bg-white/10" />
            <div className="flex flex-wrap items-center gap-3">
              <div className="h-4 w-12 animate-pulse rounded bg-white/10" />
              <div className="h-4 w-16 animate-pulse rounded bg-white/10" />
              <div className="h-4 w-14 animate-pulse rounded bg-white/10" />
            </div>
            <div className="h-9 w-32 animate-pulse rounded-full bg-white/15" />
          </div>
        </div>
      </div>

      {/* Track Listing Skeleton */}
      <div className="border-t border-border/60 p-2 sm:p-3">
        <div className="space-y-0.5">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-3 px-2 py-2 sm:px-3"
            >
              <div className="size-4 w-5 animate-pulse rounded bg-muted" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="h-3.5 w-3/4 animate-pulse rounded-md bg-muted" />
                <div className="h-3 w-1/2 animate-pulse rounded-md bg-muted/70" />
              </div>
              <div className="h-3 w-8 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default GetSpotifyAlbumWithTracksSkeleton;
