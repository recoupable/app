import { usePrivy } from "@privy-io/react-auth";
import useCatalogMeasurements from "./useCatalogMeasurements";
import useCatalogReportSongs from "./useCatalogReportSongs";
import useOwnsCatalog from "./useOwnsCatalog";
import useMeasuringPoll from "./useMeasuringPoll";
import { getCatalogReportState } from "@/lib/catalog/getCatalogReportState";

const MEASUREMENTS_PAGE_LIMIT = 100;

/**
 * Everything the report tab needs for one catalog: the measurements, the songs
 * behind the release rollups, and the single state that decides what renders.
 *
 * Composed as a hook rather than wired into the report component so the
 * component stays presentational and this stays extendable (OCP).
 */
const useCatalogReport = (catalogId: string) => {
  const { authenticated } = usePrivy();
  const measurementsQuery = useCatalogMeasurements(
    catalogId,
    undefined,
    MEASUREMENTS_PAGE_LIMIT,
  );
  const songsQuery = useCatalogReportSongs(catalogId);
  const { ownsCatalog, hasOwnCatalogs, isResolved, ownershipUnknown } =
    useOwnsCatalog(catalogId);

  const state = getCatalogReportState({
    isAuthenticated: authenticated,
    // A signed-out visitor gets the sign-in prompt straight away: the songs
    // read is only needed for the rendered report, so waiting on it would sit
    // them on a skeleton, and a stalled songs request would strand them there.
    isLoading: authenticated
      ? measurementsQuery.isLoading || songsQuery.isLoading || !isResolved
      : false,
    hasMeasurements: !!measurementsQuery.data,
    error: measurementsQuery.error,
    ownsCatalog,
    ownershipUnknown,
  });

  useMeasuringPoll(state === "measuring", measurementsQuery.refetch);

  return {
    state,
    hasOwnCatalogs,
    measurements: measurementsQuery.data,
    songs: songsQuery.data?.songs,
    totalSongs: songsQuery.data?.pagination?.total_count,
  };
};

export default useCatalogReport;
