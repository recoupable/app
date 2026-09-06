import {
  useInfiniteQuery,
  UseInfiniteQueryResult,
  InfiniteData,
} from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import isClientError from "@/lib/api/isClientError";
import BILLING_READ_TTL from "@/lib/billing/billingReadTtl";
import getAccountPayments, {
  AccountPaymentsPage,
} from "@/lib/recoup/getAccountPayments";

const PAGE_SIZE = 20;

/** An account's invoices, newest first, paged by the last id. */
const usePayments = (
  accountId: string | undefined,
): UseInfiniteQueryResult<InfiniteData<AccountPaymentsPage>> => {
  const { getAccessToken, authenticated, user } = usePrivy();
  return useInfiniteQuery({
    queryKey: ["payments", user?.id, accountId],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("Please sign in to load billing");
      return getAccountPayments(accountId as string, accessToken, {
        limit: PAGE_SIZE,
        startingAfter: pageParam,
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.payments.at(-1)?.id : undefined,
    enabled: authenticated && !!user?.id && !!accountId,
    staleTime: BILLING_READ_TTL,
    gcTime: BILLING_READ_TTL,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => !isClientError(error) && failureCount < 2,
  });
};

export default usePayments;
