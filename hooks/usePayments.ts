import {
  useInfiniteQuery,
  UseInfiniteQueryResult,
  InfiniteData,
} from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import isClientError from "@/lib/api/isClientError";
import getAccountPayments, {
  AccountPaymentsPage,
} from "@/lib/recoup/getAccountPayments";

const PAGE_SIZE = 20;
/** Same stickiness as the other billing reads (see useAccountQuery). */
const BILLING_READ_TTL = 6 * 60 * 60 * 1000;

/** An account's invoices, newest first, paged by the last id. */
const usePayments = (
  accountId: string | undefined,
): UseInfiniteQueryResult<InfiniteData<AccountPaymentsPage>> => {
  const { getAccessToken, authenticated } = usePrivy();
  return useInfiniteQuery({
    queryKey: ["payments", accountId],
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
    enabled: authenticated && !!accountId,
    staleTime: BILLING_READ_TTL,
    gcTime: BILLING_READ_TTL,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => !isClientError(error) && failureCount < 2,
  });
};

export default usePayments;
