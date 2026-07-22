import { useQuery, UseQueryResult } from "@tanstack/react-query";
import {
  getCatalogSongs,
  CatalogSongsResponse,
} from "@/lib/catalog/getCatalogSongs";

const REPORT_SONGS_PAGE_SIZE = 100;

/**
 * One-shot fetch of the first 100 catalog songs for the report's release
 * rollups — the report aggregates rather than lists, so it doesn't need the
 * infinite-scroll machinery the Manage songs tab uses.
 */
const useCatalogReportSongs = (
  catalogId: string,
): UseQueryResult<CatalogSongsResponse> => {
  return useQuery({
    queryKey: ["catalogReportSongs", catalogId],
    queryFn: () => getCatalogSongs(catalogId, REPORT_SONGS_PAGE_SIZE, 1),
    enabled: !!catalogId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export default useCatalogReportSongs;
