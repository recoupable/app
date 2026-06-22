"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Disc3 } from "lucide-react";
import { CatalogSongsResponse } from "@/lib/catalog/getCatalogSongs";
import { formatArtists } from "@/lib/catalog/formatArtists";
import { ToolCardRow } from "../shared/ToolCard";
import { cn } from "@/lib/utils";

interface CatalogSongRowProps {
  song: CatalogSongsResponse["songs"][0];
}

// Deterministic tint behind the disc glyph so a long list has visual anchors.
const ART_TINTS = [
  "bg-rose-500/10 text-rose-500",
  "bg-amber-500/10 text-amber-500",
  "bg-emerald-500/10 text-emerald-500",
  "bg-sky-500/10 text-sky-500",
  "bg-violet-500/10 text-violet-500",
  "bg-fuchsia-500/10 text-fuchsia-500",
];

const tintFor = (seed: string): string => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return ART_TINTS[Math.abs(hash) % ART_TINTS.length];
};

const CatalogSongRow = ({ song }: CatalogSongRowProps) => {
  const reduce = useReducedMotion();
  const [isExpanded, setIsExpanded] = useState(false);

  const title = song.name?.trim() || "Untitled";
  const artists = formatArtists(song.artists);
  const hasNotes = !!song.notes && song.notes.trim().length > 0;
  const tint = tintFor(song.isrc || title || artists);

  return (
    <ToolCardRow className="items-start">
        {/* Artwork placeholder — songs table carries no cover art. */}
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            tint,
          )}
        >
          <Disc3 className="size-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
              {title}
            </span>
          </div>

          <p className="truncate text-xs text-muted-foreground">
            {artists}
            {song.album ? ` · ${song.album}` : ""}
          </p>

          {/* Metadata pills + the notes control (visually distinct from a status pill). */}
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {song.isrc ? (
              <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                {song.isrc}
              </span>
            ) : (
              <span className="inline-flex items-center rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                No ISRC
              </span>
            )}
            {hasNotes ? (
              <button
                type="button"
                onClick={() => setIsExpanded((v) => !v)}
                aria-expanded={isExpanded}
                className="inline-flex items-center gap-0.5 rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
              >
                {isExpanded ? "Hide notes" : "Notes"}
                <ChevronDown
                  className={cn(
                    "size-3 transition-transform duration-200",
                    isExpanded && "rotate-180",
                  )}
                />
              </button>
            ) : null}
          </div>

          <AnimatePresence initial={false}>
            {hasNotes && isExpanded ? (
              <motion.div
                key="notes"
                initial={reduce ? false : { height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                transition={{
                  duration: reduce ? 0 : 0.22,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="overflow-hidden"
              >
                <p className="mt-1.5 whitespace-pre-wrap rounded-lg bg-muted/60 px-2 py-1.5 text-xs text-muted-foreground">
                  {song.notes}
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </ToolCardRow>
  );
};

export default CatalogSongRow;
