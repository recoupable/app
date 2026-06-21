"use client";

import { useState } from "react";
import { Disc3 } from "lucide-react";
import { CatalogSongsResponse } from "@/lib/catalog/getCatalogSongs";
import { formatArtists } from "@/lib/catalog/formatArtists";
import { ToolCardRow } from "../shared/ToolCard";
import { cn } from "@/lib/utils";

interface CatalogSongRowProps {
  song: CatalogSongsResponse["songs"][0];
}

const CatalogSongRow = ({ song }: CatalogSongRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const title = song.name?.trim() || "Untitled";
  const artists = formatArtists(song.artists);
  const hasNotes = !!song.notes && song.notes.trim().length > 0;

  return (
    <li>
      <ToolCardRow className="items-start">
        {/* Artwork placeholder — songs table carries no cover art */}
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
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

          {/* Metadata pills */}
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
                className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-muted-foreground/15"
              >
                {isExpanded ? "Hide notes" : "Notes"}
              </button>
            ) : null}
          </div>

          {hasNotes && isExpanded ? (
            <p
              className={cn(
                "mt-1.5 whitespace-pre-wrap rounded-lg bg-muted/60 px-2 py-1.5 text-xs text-muted-foreground",
              )}
            >
              {song.notes}
            </p>
          ) : null}
        </div>
      </ToolCardRow>
    </li>
  );
};

export default CatalogSongRow;
