"use client";

import { useEffect, useMemo } from "react";
import { usePrivy } from "@privy-io/react-auth";
import useCatalogMeasurements from "@/hooks/useCatalogMeasurements";
import useCatalogReportSongs from "@/hooks/useCatalogReportSongs";
import useOwnsCatalog from "@/hooks/useOwnsCatalog";
import { getCatalogReportState } from "@/lib/catalog/getCatalogReportState";
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

const MEASUREMENTS_PAGE_LIMIT = 100;
/** A seeded catalog's first measurement lands in roughly a minute. */
const MEASURING_POLL_MS = 5000;

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
  const { authenticated } = usePrivy();
  const { ownsCatalog, isResolved: ownershipResolved } =
    useOwnsCatalog(catalogId);

  const measurements = measurementsQuery.data;
  const songs = songsQuery.data?.songs;

  const state = getCatalogReportState({
    isAuthenticated: authenticated,
    isLoading:
      measurementsQuery.isLoading ||
      songsQuery.isLoading ||
      (authenticated && !ownershipResolved),
    hasMeasurements: !!measurements,
    error: measurementsQuery.error,
    ownsCatalog,
  });

  // The owner's measurement is still running, so pull again instead of leaving
  // them on an empty report to re-run the whole valuation (chat#1912 row 1).
  const { refetch } = measurementsQuery;
  useEffect(() => {
    if (state !== "measuring") return;
    const id = setInterval(() => refetch(), MEASURING_POLL_MS);
    return () => clearInterval(id);
  }, [state, refetch]);

  const releases = useMemo(
    () => buildReleaseRollups(songs ?? [], measurements?.measurements ?? []),
    [songs, measurements?.measurements],
  );

  if (state === "loading") return <CatalogReportSkeleton />;
  if (state !== "ready" || !measurements) {
    return (
      <CatalogReportEmptyState
        state={state === "ready" ? "error" : state}
      />
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
