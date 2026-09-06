import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import isClientError from "@/lib/api/isClientError";

type Fetcher<T> = (accountId: string, accessToken: string) => Promise<T>;

/** Billing changes on a scale of days: keep a read for six hours, and never reload it on tab focus. */
const BILLING_READ_TTL = 6 * 60 * 60 * 1000;

/** The shared shape of the billing reads: one key per account, Privy bearer, sticky for hours. */
const useAccountQuery = <T>(
  key: string | string[],
  accountId: string | undefined,
  fetcher: Fetcher<T>,
): UseQueryResult<T> => {
  const { getAccessToken, authenticated } = usePrivy();
  return useQuery({
    queryKey: [...(Array.isArray(key) ? key : [key]), accountId],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("Please sign in to load billing");
      return fetcher(accountId as string, accessToken);
    },
    enabled: authenticated && !!accountId,
    staleTime: BILLING_READ_TTL,
    gcTime: BILLING_READ_TTL,
    refetchOnWindowFocus: false,
    // A 4xx will not change on retry; only network and server errors are worth a second try.
    retry: (failureCount, error) => !isClientError(error) && failureCount < 2,
  });
};

export default useAccountQuery;
