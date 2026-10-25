import {
  useInfiniteQuery,
  InfiniteData,
  UseInfiniteQueryResult,
} from "@tanstack/react-query";
import {
  CatalogSongsResponse,
  getCatalogSongs,
} from "@/lib/catalog/getCatalogSongs";
import { usePrivy } from "@privy-io/react-auth";

interface UseCatalogSongsOptions {
  catalogId: string;
  pageSize?: number;
  enabled?: boolean;
  artistName?: string;
}

type UseCatalogSongsReturn = UseInfiniteQueryResult<
  InfiniteData<CatalogSongsResponse>
>;

const useCatalogSongs = ({
  catalogId,
  pageSize = 50,
  enabled = true,
  artistName,
}: UseCatalogSongsOptions): UseCatalogSongsReturn => {
  const { getAccessToken } = usePrivy();

  const queryResult = useInfiniteQuery({
    queryKey: ["catalogSongs", catalogId, pageSize, artistName],
    queryFn: async ({ pageParam = 1 }) => {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Not authenticated");
      }
      return await getCatalogSongs(
        accessToken,
        catalogId,
        pageSize,
        pageParam,
        artistName,
      );
    },
    enabled: enabled && !!catalogId,
    getNextPageParam: (lastPage) => {
      const { page, total_pages } = lastPage.pagination;
      const nextPage = page < total_pages ? page + 1 : undefined;
      return nextPage;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return queryResult;
};

export default useCatalogSongs;
