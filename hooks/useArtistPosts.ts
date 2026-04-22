import {
  useInfiniteQuery,
  type UseInfiniteQueryResult,
  type InfiniteData,
} from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import fetchPosts, {
  type PostsResponse,
  type PostsError,
} from "@/lib/recoup/fetchPosts";

export type PostsInfiniteResponse = {
  pages: PostsResponse[];
  pageParams: number[];
};

/**
 * Hook to fetch and manage posts for an artist with infinite scrolling
 */
export function useArtistPosts(
  artistAccountId?: string,
  limit: number = 20
): UseInfiniteQueryResult<InfiniteData<PostsResponse>, PostsError> {
  const { getAccessToken, authenticated } = usePrivy();

  return useInfiniteQuery<PostsResponse, PostsError>({
    queryKey: ["posts", artistAccountId, limit],
    queryFn: async ({ pageParam }) => {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw { message: "No access token" } as PostsError;
      }
      return fetchPosts({
        artistAccountId: artistAccountId!,
        accessToken,
        page: pageParam as number,
        limit,
      });
    },
    getNextPageParam: (lastPage: PostsResponse) => {
      const { page, total_pages } = lastPage.pagination;
      return page < total_pages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!artistAccountId && authenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      return failureCount < 2 && !("status" in error);
    },
  });
}
