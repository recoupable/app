import {
  useInfiniteQuery,
  type UseInfiniteQueryResult,
  type InfiniteData,
} from "@tanstack/react-query";
import { useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

export interface Social {
  id: string;
  username: string;
  avatar: string | null;
  profile_url: string;
  region: string;
  bio: string;
  followerCount: number;
  followingCount: number;
  updated_at: string;
}

export interface FansResponse {
  status: string;
  fans: Social[];
  pagination: {
    total_count: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface FansError {
  message: string;
  status?: number;
}

/**
 * Fetches fans for a specific artist from the API with pagination
 */
async function fetchFans(
  artistAccountId: string,
  accessToken: string,
  page: number = 1,
  limit: number = 20
): Promise<FansResponse> {
  try {
    const response = await fetch(
      `${getClientApiBaseUrl()}/api/artists/${artistAccountId}/fans?page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error: FansError = {
        message: "Failed to fetch fans",
        status: response.status,
      };
      throw error;
    }

    const data: FansResponse = await response.json();

    if (data.status !== "success") {
      throw { message: "API returned error status" } as FansError;
    }

    return data;
  } catch (error) {
    // Ensure we're always throwing a consistent error shape
    if (typeof error === "object" && error !== null && "message" in error) {
      throw error;
    }
    throw { message: "An unexpected error occurred" } as FansError;
  }
}

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
      return fetchFans(artistAccountId!, accessToken!, pageParam, limit);
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
