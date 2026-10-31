"use client";

import { useState } from "react";
import type { CatalogSongsResponse } from "@/lib/catalog/getCatalogSongs";
import CatalogSongRow from "./CatalogSongRow";
import CatalogSongsPagination from "./CatalogSongsPagination";

interface InsertCatalogSongsListProps {
  songs: CatalogSongsResponse["songs"];
  unfilteredCount?: number;
}

/**
 * Displays catalog songs in a table format
 * Shows full metadata: title, artist, album, ISRC, and notes
 */
export default function InsertCatalogSongsList({
  songs,
  unfilteredCount,
}: InsertCatalogSongsListProps) {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(songs.length / 50));
  const currentPage = Math.min(page, pageCount - 1);
  // A replacement may shrink the result; appending loaded rows keeps the page.
  if (page !== currentPage) setPage(currentPage);
  const start = currentPage * 50;
  const visibleSongs = songs.slice(start, start + 50);
  const total = unfilteredCount ?? songs?.length ?? 0;
  const hiddenCount = Math.max(0, total - (songs?.length ?? 0));

  if (!songs || songs.length === 0) {
    return (
      <p className="mt-2 text-sm text-muted-foreground">
        {hiddenCount > 0
          ? "No songs match this filter. Turn it off to show all returned songs."
          : "No songs returned."}
      </p>
    );
  }

  return (
    <div className="mt-2">
      {pageCount > 1 && (
        <CatalogSongsPagination
          page={currentPage}
          pageCount={pageCount}
          onPageChange={setPage}
        />
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 font-semibold text-foreground">
                Title
              </th>
              <th className="text-left py-2 px-3 font-semibold text-foreground">
                Artist
              </th>
              <th className="text-left py-2 px-3 font-semibold text-foreground">
                Album
              </th>
              <th className="text-left py-2 px-3 font-semibold text-foreground">
                ISRC
              </th>
              <th className="text-left py-2 px-3 font-semibold text-foreground">
                Notes
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleSongs.map((song, index) => (
              <CatalogSongRow key={song.isrc || start + index} song={song} />
            ))}
          </tbody>
        </table>
      </div>
      {songs.length > 0 && (
        <div className="text-xs text-muted-foreground mt-2 px-3">
          {pageCount > 1
            ? hiddenCount > 0
              ? `Showing ${start + 1}–${start + visibleSongs.length} of ${songs.length} matching songs (${total} returned; ${hiddenCount} hidden)`
              : `Showing ${start + 1}–${start + visibleSongs.length} of ${songs.length} returned songs`
            : hiddenCount > 0
              ? `Showing ${songs.length} of ${total} returned songs (${hiddenCount} hidden)`
              : `Showing ${songs.length} song${songs.length !== 1 ? "s" : ""}`}
        </div>
      )}
    </div>
  );
}
