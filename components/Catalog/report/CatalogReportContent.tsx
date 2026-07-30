"use client";

import { useMemo } from "react";
import useCatalogReport from "@/hooks/useCatalogReport";
import { computeCatalogValuation } from "@/lib/valuation/computeCatalogValuation";
import { buildReleaseRollups } from "@/lib/catalog/buildReleaseRollups";
import { buildReportInsights } from "@/lib/valuation/buildReportInsights";
import CatalogValuationCard from "./CatalogValuationCard";
import CatalogReportStats from "./CatalogReportStats";
import CatalogReleasesTable from "./CatalogReleasesTable";
import CatalogReportInsights from "./CatalogReportInsights";
import CatalogReportCta from "./CatalogReportCta";
import CatalogReportSkeleton from "./CatalogReportSkeleton";
import CatalogReportEmptyState from "./CatalogReportEmptyState";

interface CatalogReportContentProps {
  catalogId: string;
}

/**
 * The report body: valuation echo, measured-scope stats, per-release table,
 * diagnosis + prescription, and the single primary next action. Pre-v2
 * measurement responses can omit the whole-scope aggregates, so totals fall
 * back to summing the fetched page rather than rendering blanks.
 *
 * Data, report state and the measuring poll all live in `useCatalogReport`;
 * this component only renders what that state describes.
 */
const CatalogReportContent = ({ catalogId }: CatalogReportContentProps) => {
  const { state, measurements, songs, totalSongs } =
    useCatalogReport(catalogId);

  const releases = useMemo(
    () => buildReleaseRollups(songs ?? [], measurements?.measurements ?? []),
    [songs, measurements?.measurements],
  );

  if (state === "loading") return <CatalogReportSkeleton />;
  if (state !== "ready" || !measurements) {
    return <CatalogReportEmptyState state={state === "ready" ? "error" : state} />;
  }

  const totalStreams =
    measurements.total_streams ??
    measurements.measurements.reduce((sum, m) => sum + (m?.playcount ?? 0), 0);
  const measuredSongCount =
    measurements.measured_song_count ?? measurements.measurements.length;
  const valuation = computeCatalogValuation({
    totalStreams,
    catalogAgeYears: measurements.catalog_age_years,
  });
  const insights = buildReportInsights({
    totalSongs: totalSongs ?? measuredSongCount,
    measuredSongCount,
    releaseStreamShares:
      totalStreams > 0 ? releases.map((r) => r.streams / totalStreams) : [],
  });

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      <CatalogValuationCard valuation={valuation} />
      <CatalogReportStats
        totalStreams={totalStreams}
        measuredSongCount={measuredSongCount}
        totalSongs={totalSongs ?? measuredSongCount}
        releaseCount={releases.length}
        catalogAgeYears={valuation.catalogAgeYears}
      />
      <CatalogReleasesTable releases={releases} />
      <CatalogReportInsights insights={insights} />
      <CatalogReportCta />
    </div>
  );
};

export default CatalogReportContent;
