"use client";

import { useMemo } from "react";
import useCatalogMeasurements from "@/hooks/useCatalogMeasurements";
import useCatalogReportSongs from "@/hooks/useCatalogReportSongs";
import { computeCatalogValuation } from "@/lib/valuation/computeCatalogValuation";
import { buildReleaseRollups } from "@/lib/catalog/buildReleaseRollups";
import { buildReportInsights } from "@/lib/valuation/buildReportInsights";
import CatalogValuationCard from "./CatalogValuationCard";
import CatalogReportStats from "./CatalogReportStats";
import CatalogReleasesTable from "./CatalogReleasesTable";
import CatalogReportInsights from "./CatalogReportInsights";
import CatalogReportCta from "./CatalogReportCta";
import CatalogReportSkeleton from "./CatalogReportSkeleton";
import CatalogReportError from "./CatalogReportError";
import CatalogReportEmailCapture from "./CatalogReportEmailCapture";

interface CatalogReportContentProps {
  catalogId: string;
}

const MEASUREMENTS_PAGE_LIMIT = 100;

/**
 * The report body: valuation echo, measured-scope stats, per-release table,
 * diagnosis + prescription, and the single primary next action. Pre-v2
 * measurement responses can omit the whole-scope aggregates, so totals fall
 * back to summing the fetched page rather than rendering blanks.
 */
const CatalogReportContent = ({ catalogId }: CatalogReportContentProps) => {
  const measurementsQuery = useCatalogMeasurements(
    catalogId,
    undefined,
    MEASUREMENTS_PAGE_LIMIT,
  );
  const songsQuery = useCatalogReportSongs(catalogId);

  const measurements = measurementsQuery.data;
  const songs = songsQuery.data?.songs;

  const releases = useMemo(
    () => buildReleaseRollups(songs ?? [], measurements?.measurements ?? []),
    [songs, measurements?.measurements],
  );

  if (measurementsQuery.isLoading || songsQuery.isLoading) {
    return <CatalogReportSkeleton />;
  }
  if (!measurements) {
    // Anonymous viewers can land here (the measurements query needs auth), so
    // the capture must still render: the emailed link brings them back.
    return (
      <div className="flex flex-col gap-4 max-w-3xl">
        <CatalogReportError error={measurementsQuery.error} />
        <CatalogReportEmailCapture catalogId={catalogId} />
      </div>
    );
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
  const totalSongs =
    songsQuery.data?.pagination?.total_count ?? measuredSongCount;
  const insights = buildReportInsights({
    totalSongs,
    measuredSongCount,
    releaseStreamShares:
      totalStreams > 0 ? releases.map((r) => r.streams / totalStreams) : [],
  });

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      <CatalogValuationCard valuation={valuation} />
      <CatalogReportEmailCapture
        catalogId={catalogId}
        headlineValue={valuation.valueBand.central}
      />
      <CatalogReportStats
        totalStreams={totalStreams}
        measuredSongCount={measuredSongCount}
        totalSongs={totalSongs}
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
