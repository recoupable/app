import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { NEW_API_BASE_URL } from "@/lib/consts";
import { useUserProvider } from "@/providers/UserProvder";

export interface ProStatusResponse {
  isPro: boolean;
}

/**
 * GET /api/subscriptions/status on Recoup API (requires Privy bearer).
 */
const fetchProStatus = async (
  accountId: string,
  accessToken: string,
): Promise<ProStatusResponse> => {
  const url = new URL("/api/subscriptions/status", NEW_API_BASE_URL);
  url.searchParams.set("accountId", accountId);
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }
  return response.json();
};

/**
 * Hook to get account's pro status including org subscription check
 */
const useProStatus = (): UseQueryResult<ProStatusResponse> => {
  const { userData } = useUserProvider();
  const { getAccessToken, authenticated } = usePrivy();
  return useQuery({
    queryKey: ["proStatus", userData?.account_id],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Please sign in to load subscription status");
      }
      return fetchProStatus(userData?.account_id || "", accessToken);
    },
    enabled: authenticated && !!userData?.account_id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
  });
};

export default useProStatus;
