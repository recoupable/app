import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import getAccountSubscription, {
  AccountSubscription,
} from "@/lib/recoup/getAccountSubscription";

/** The plan covering an account, with amount, interval and collection method. */
const useSubscription = (
  accountId: string | undefined,
): UseQueryResult<AccountSubscription> => {
  const { getAccessToken, authenticated } = usePrivy();
  return useQuery({
    queryKey: ["subscription", accountId],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("Please sign in to load billing");
      return getAccountSubscription(accountId as string, accessToken);
    },
    enabled: authenticated && !!accountId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });
};

export default useSubscription;
