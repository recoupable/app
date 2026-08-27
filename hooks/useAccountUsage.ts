import { useInfiniteQuery, UseInfiniteQueryResult, InfiniteData } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import getAccountUsage, { AccountUsagePage } from "@/lib/recoup/getAccountUsage";
import { useUserProvider } from "@/providers/UserProvder";

const PAGE_SIZE = 20;

/**
 * The signed-in account's charge line items, newest first, one page per
 * `next_cursor`. Auth and account come from the providers; nothing is passed in.
 */
const useAccountUsage = (): UseInfiniteQueryResult<InfiniteData<AccountUsagePage>> => {
  const { userData } = useUserProvider();
  const { getAccessToken, authenticated } = usePrivy();
  const accountId = userData?.account_id as string | undefined;

  return useInfiniteQuery({
    queryKey: ["usage", accountId],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("Please sign in to load usage");
      return getAccountUsage(accountId as string, accessToken, { limit: PAGE_SIZE, cursor: pageParam });
    },
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    enabled: authenticated && !!accountId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export default useAccountUsage;
