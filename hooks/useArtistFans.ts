import {
  useInfiniteQuery,
  type UseInfiniteQueryResult,
  type InfiniteData,
} from "@tanstack/react-query";
import { useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  fetchArtistFans,
  type FansResponse,
  type Social,
  type FansError,
} from "@/lib/fans/fetchArtistFans";

export type { Social, FansResponse, FansError };

/**
 * Hook to fetch and manage fans for an artist with automatic pagination
 * This hook will automatically fetch all pages with a controlled delay between requests
 */
export function useArtistFans(
  artistAccountId?: string,
  limit: number = 20
): UseInfiniteQueryResult<InfiniteData<FansResponse, unknown>, Error> {
  const { getAccessToken, authenticated } = usePrivy();

  const queryResult = useInfiniteQuery({
    queryKey: ["fans", artistAccountId, limit],
    queryFn: async ({ pageParam = 1 }) => {
      const accessToken = await getAccessToken();
      return fetchArtistFans(artistAccountId!, accessToken!, pageParam, limit);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage;
      // If we're on the last page, return undefined to indicate no more pages
      if (pagination.page >= pagination.total_pages) {
        return undefined;
      }
      // Otherwise, return the next page number
      return pagination.page + 1;
    },
    enabled: !!artistAccountId && authenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Only retry network errors, not 4xx/5xx responses
      return failureCount < 2 && !("status" in error);
    },
  });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = queryResult;

  // Automatically fetch all pages with a controlled delay
  useEffect(() => {
    // Only proceed if we have data, there are more pages, and we're not already fetching
    if (data && hasNextPage && !isFetchingNextPage) {
      // Use a timeout to avoid overwhelming the API with requests
      const timeoutId = setTimeout(() => {
        fetchNextPage();
      }, 500); // 500ms delay between page requests

      // Clean up the timeout if the component unmounts
      return () => clearTimeout(timeoutId);
    }
  }, [data, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return queryResult;
}
