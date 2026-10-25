"use client";

import { useState } from "react";
import CatalogSongsPagination from "@/components/VercelChat/tools/catalog/CatalogSongsPagination";
import { buildCatalogTrackRows } from "@/lib/catalog/buildCatalogTrackRows";
import type { CatalogSong } from "@/lib/catalog/getCatalogSongs";
import type { CatalogSongMeasurement } from "@/lib/catalog/getCatalogMeasurements";

interface CatalogTracksTableProps {
  measurements: CatalogSongMeasurement[];
  songs?: CatalogSong[];
}

export default function CatalogTracksTable({
  measurements,
  songs,
}: CatalogTracksTableProps) {
  const [page, setPage] = useState(0);
  const rows = buildCatalogTrackRows(measurements, songs);
  const pageCount = Math.max(1, Math.ceil(rows.length / 50));
  const currentPage = Math.min(page, pageCount - 1);
  if (page !== currentPage) setPage(currentPage);
  const start = currentPage * 50;
  const visible = rows.slice(start, start + 50);
  if (!rows.length) return null;

  return (
    <section
      aria-label="Track play counts"
      className="rounded-2xl bg-card p-4 sm:p-6 shadow-[0_0_0_1px_var(--border)]"
    >
      <h2 className="font-heading text-lg font-medium">Track play counts</h2>
      <p className="text-sm text-muted-foreground py-2">
        Showing {start + 1}–{start + visible.length} of {rows.length} loaded
        measurements. The report loads up to 100; this list may not cover the
        whole catalog. Counts are saved observations, not live streams.
      </p>
      {pageCount > 1 && (
        <CatalogSongsPagination
          page={currentPage}
          pageCount={pageCount}
          onPageChange={setPage}
        />
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              {["Track", "Artist", "ISRC", "Play count", "Measured at"].map(
                (label) => (
                  <th key={label} scope="col" className="p-2 font-medium">
                    {label}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {visible.map((row, index) => (
              <tr
                key={start + index}
                className="border-b border-border last:border-0"
              >
                <td className="p-2">{row.title}</td>
                <td className="p-2">{row.artist}</td>
                <td className="p-2 font-mono">{row.isrc || "Unknown ISRC"}</td>
                <td className="p-2 tabular-nums">
                  {row.playcount === null
                    ? "Unknown"
                    : row.playcount.toLocaleString("en-US")}
                </td>
                <td className="p-2">{row.measuredAt || "Unknown"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
