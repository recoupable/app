import useCatalogMeasurements from "./useCatalogMeasurements";
import useCatalogReportSongs from "./useCatalogReportSongs";
import { useCatalogReportScope } from "./useCatalogReportScope";
import useMeasuringPoll from "./useMeasuringPoll";
import { getCatalogReportState } from "@/lib/catalog/getCatalogReportState";
import { getCatalogSongTotal } from "@/lib/catalog/getCatalogSongTotal";

const MEASUREMENTS_PAGE_LIMIT = 100;

/** Every report result is gated by current catalog and workspace authority. */
const useCatalogReport = (catalogId: string) => {
  const scope = useCatalogReportScope(catalogId);
  const authorized = scope.state === "authorized";
  const measurementsQuery = useCatalogMeasurements(
    catalogId,
    undefined,
    MEASUREMENTS_PAGE_LIMIT,
    authorized,
  );
  const songsQuery = useCatalogReportSongs(catalogId, authorized);
  const state =
    scope.state !== "authorized"
      ? scope.state
      : getCatalogReportState({
          isAuthenticated: true,
          isLoading: measurementsQuery.isPending || songsQuery.isLoading,
          hasMeasurements:
            measurementsQuery.isSuccess && !!measurementsQuery.data,
          error: measurementsQuery.error,
          ownsCatalog: true,
          ownershipUnknown: false,
        });
  useMeasuringPoll(state === "measuring", measurementsQuery.refetch);
  const songsAvailable =
    authorized && songsQuery.isSuccess && !songsQuery.isFetching;
  return {
    state,
    hasOwnCatalogs: scope.hasOwnCatalogs,
    measurements:
      authorized && measurementsQuery.isSuccess
        ? measurementsQuery.data
        : undefined,
    songs: songsAvailable ? songsQuery.data?.songs : undefined,
    totalSongs: songsAvailable
      ? getCatalogSongTotal(songsQuery.data?.pagination?.total_count)
      : undefined,
  };
};
export default useCatalogReport;
