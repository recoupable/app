import {
  useInfiniteQuery,
  UseInfiniteQueryResult,
  InfiniteData,
} from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import getAccountUsage, {
  AccountUsagePage,
} from "@/lib/recoup/getAccountUsage";
import { useUserProvider } from "@/providers/UserProvder";
import type { UsageSort } from "@/lib/usage/usageSort";

const PAGE_SIZE = 20;

/**
 * The signed-in account's charge line items, one page per `next_cursor`,
 * newest first or most expensive first. Auth and account come from the
 * providers; the sort is the one instance-scoped input, and a new sort is a
 * new query, so paging starts over.
 */
const useAccountUsage = ({
  sort,
}: {
  sort: UsageSort;
}): UseInfiniteQueryResult<InfiniteData<AccountUsagePage>> => {
  const { userData } = useUserProvider();
  const { getAccessToken, authenticated } = usePrivy();
  const accountId = userData?.account_id as string | undefined;

  return useInfiniteQuery({
    queryKey: ["usage", accountId, sort],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("Please sign in to load usage");
      return getAccountUsage(accountId as string, accessToken, {
        limit: PAGE_SIZE,
        cursor: pageParam,
        sort,
      });
    },
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    enabled: authenticated && !!accountId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export default useAccountUsage;
