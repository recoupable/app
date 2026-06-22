"use client";

import { motion } from "framer-motion";
import { FileMusic } from "lucide-react";
import { CatalogSongsResponse } from "@/lib/catalog/getCatalogSongs";
import { formatArtists } from "@/lib/catalog/formatArtists";
import CatalogSongRow from "./CatalogSongRow";
import { ToolEmpty } from "../shared/ToolEmpty";

interface InsertCatalogSongsListProps {
  songs: CatalogSongsResponse["songs"];
  /** Total songs before filtering, so the footer can report what's hidden. */
  totalCount?: number;
}

// Cap the cascade so long imports don't feel slow to assemble.
const STAGGER_CAP = 10;

/**
 * Displays catalog songs as a polished list of rows.
 * Each row shows artwork placeholder, title, artist/album and metadata pills.
 */
export default function InsertCatalogSongsList({
  songs,
  totalCount,
}: InsertCatalogSongsListProps) {
  if (!songs || songs.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card">
        <ToolEmpty
          icon={FileMusic}
          title="No songs to show"
          description="Songs matching the current filter will appear here."
        />
      </div>
    );
  }

  const total = totalCount ?? songs.length;
  const hidden = Math.max(0, total - songs.length);
  // Always say what's hidden under a filter — a bare count reads as data loss.
  const footer =
    hidden > 0
      ? `Showing ${songs.length} of ${total} (${hidden} hidden)`
      : `Showing ${songs.length} song${songs.length !== 1 ? "s" : ""}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <ul className="divide-y divide-border/60 p-1.5">
        {songs.map((song, index) => (
          <motion.div
            key={song.isrc || `${song.name}-${formatArtists(song.artists)}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.22,
              delay: Math.min(index, STAGGER_CAP) * 0.03,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <CatalogSongRow song={song} />
          </motion.div>
        ))}
      </ul>
      <div className="border-t border-border/60 px-3 py-2 text-xs tabular-nums text-muted-foreground">
        {footer}
      </div>
    </div>
  );
}
