import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useUserProvider } from "@/providers/UserProvder";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

export interface ProStatusResponse {
  isPro: boolean;
}

const fetchProStatus = async (
  accountId: string,
): Promise<ProStatusResponse> => {
  const response = await fetch(
    `${getClientApiBaseUrl()}/api/subscription/status?accountId=${encodeURIComponent(accountId)}`,
  );
  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }
  return response.json();
};

const useProStatus = (): UseQueryResult<ProStatusResponse> => {
  const { userData } = useUserProvider();
  return useQuery({
    queryKey: ["proStatus", userData?.account_id],
    queryFn: () => fetchProStatus(userData?.account_id || ""),
    enabled: !!userData?.account_id,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
};

export default useProStatus;
