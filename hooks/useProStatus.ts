import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useUserProvider } from "@/providers/UserProvder";
import { ProStatusResponse } from "@/app/api/subscription/status/route";

/**
 * Fetch pro status from the API
 *
 * @param accountId
 */
const fetchProStatus = async (accountId: string): Promise<ProStatusResponse> => {
  const response = await fetch(`/api/subscription/status?accountId=${accountId}`);
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
  return useQuery({
    queryKey: ["proStatus", userData?.account_id],
    queryFn: () => fetchProStatus(userData?.account_id || ""),
    enabled: !!userData?.account_id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
  });
};

export default useProStatus;
