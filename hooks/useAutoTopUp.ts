import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import getAccountAutoTopUp, {
  AutoTopUpSettings,
} from "@/lib/recoup/getAccountAutoTopUp";

/** The opt-in auto top-up settings for an account. */
const useAutoTopUp = (
  accountId: string | undefined,
): UseQueryResult<AutoTopUpSettings> => {
  const { getAccessToken, authenticated } = usePrivy();
  return useQuery({
    queryKey: ["autoTopUp", accountId],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("Please sign in to load billing");
      return getAccountAutoTopUp(accountId as string, accessToken);
    },
    enabled: authenticated && !!accountId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

export default useAutoTopUp;
