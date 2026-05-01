import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { useUserProvider } from "@/providers/UserProvder";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

export interface ProStatusResponse {
  isPro: boolean;
}

const fetchProStatus = async (
  accessToken: string,
): Promise<ProStatusResponse> => {
  const response = await fetch(
    `${getClientApiBaseUrl()}/api/subscriptions/status`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }
  return response.json();
};

const useProStatus = (): UseQueryResult<ProStatusResponse> => {
  const { userData } = useUserProvider();
  const { getAccessToken, authenticated } = usePrivy();
  return useQuery({
    queryKey: ["proStatus", userData?.account_id],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      return fetchProStatus(accessToken!);
    },
    enabled: !!userData?.account_id && authenticated,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
};

export default useProStatus;
