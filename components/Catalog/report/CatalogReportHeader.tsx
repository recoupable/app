"use client";

import { useCatalogReportHeader } from "@/hooks/useCatalogReportHeader";

interface CatalogReportHeaderProps {
  catalogId: string;
}

export default function CatalogReportHeader({
  catalogId,
}: CatalogReportHeaderProps) {
  const { catalogName, totalSongs } = useCatalogReportHeader(catalogId);
  return (
    <header className="pb-4">
      <h1 className="font-heading text-lg font-bold md:text-xl break-words">
        {catalogName ? `${catalogName} — Catalog Report` : "Catalog Report"}
      </h1>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {totalSongs === undefined
          ? "Total songs unknown"
          : `${totalSongs.toLocaleString("en-US")} ${totalSongs === 1 ? "song" : "songs"} in catalog`}
      </p>
    </header>
  );
}
