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
import rangeToPeriod from "@/lib/usage/rangeToPeriod";
import type { UsageRange } from "@/lib/usage/usageRanges";
import { useMemo } from "react";

const PAGE_SIZE = 20;

/**
 * The signed-in account's charge line items for a range, newest first, one
 * page per `next_cursor`. Auth and account come from the providers; the range
 * is the one instance-scoped input. A new range is a new query, so paging
 * starts over.
 */
const useAccountUsage = ({
  range,
}: {
  range: UsageRange;
}): UseInfiniteQueryResult<InfiniteData<AccountUsagePage>> => {
  const { userData } = useUserProvider();
  const { getAccessToken, authenticated } = usePrivy();
  const accountId = userData?.account_id as string | undefined;
  const period = useMemo(() => rangeToPeriod(range, new Date()), [range]);

  return useInfiniteQuery({
    queryKey: ["usage", accountId, period.from, period.to],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("Please sign in to load usage");
      return getAccountUsage(accountId as string, accessToken, {
        limit: PAGE_SIZE,
        cursor: pageParam,
        ...period,
      });
    },
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    enabled: authenticated && !!accountId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export default useAccountUsage;
