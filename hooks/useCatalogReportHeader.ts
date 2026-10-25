import { useCatalogReportScope } from "./useCatalogReportScope";
import useCatalogReportSongs from "./useCatalogReportSongs";
import { getCatalogSongTotal } from "@/lib/catalog/getCatalogSongTotal";

/** Identity and membership count remain independent of report readiness. */
export function useCatalogReportHeader(catalogId: string) {
  const scope = useCatalogReportScope(catalogId);
  const songs = useCatalogReportSongs(catalogId, scope.state === "authorized");
  return {
    catalogName: scope.catalog?.name,
    totalSongs:
      scope.catalog && songs.isSuccess && !songs.isFetching
        ? getCatalogSongTotal(songs.data?.pagination?.total_count)
        : undefined,
  };
}
