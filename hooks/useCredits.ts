import { skipToken, useQuery, UseQueryResult } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import getAccountCredits, {
  AccountCredits,
} from "@/lib/recoup/getAccountCredits";
import { useUserProvider } from "@/providers/UserProvder";

const useCredits = (): UseQueryResult<AccountCredits> => {
  const { userData } = useUserProvider();
  const { getAccessToken, authenticated } = usePrivy();
  const accountId = userData?.account_id;
  return useQuery({
    queryKey: ["credits", accountId],
    // Two different paths have to be closed. `enabled` stops react-query from
    // fetching on its own, but it does not apply to `refetch()` — `usePayment`
    // exposes that as `refetchCredits` and `useVercelChat` calls it on finish.
    // `skipToken` is what covers the manual path, and narrowing `accountId`
    // here is what lets the id reach `getAccountCredits` without a cast
    // asserting a value we may not have (chat#1949 F4b).
    queryFn: accountId
      ? async () => {
          const accessToken = await getAccessToken();
          if (!accessToken) {
            throw new Error("Please sign in to load credits");
          }
          return getAccountCredits(accountId, accessToken);
        }
      : skipToken,
    enabled: authenticated && !!accountId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

export default useCredits;
