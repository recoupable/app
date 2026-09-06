import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import isClientError from "@/lib/api/isClientError";
import BILLING_READ_TTL from "@/lib/billing/billingReadTtl";

type Fetcher<T> = (accountId: string, accessToken: string) => Promise<T>;

/**
 * The shared shape of the billing reads: keyed by viewer and account (a later
 * sign-in on the same browser never sees an earlier viewer's cache), Privy
 * bearer, sticky for hours unless the caller asks for fresher data.
 */
const useAccountQuery = <T>(
  key: string | string[],
  accountId: string | undefined,
  fetcher: Fetcher<T>,
  options: { staleTime?: number; refetchOnWindowFocus?: boolean } = {},
): UseQueryResult<T> => {
  const { getAccessToken, authenticated, user } = usePrivy();
  return useQuery({
    queryKey: [...(Array.isArray(key) ? key : [key]), user?.id, accountId],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("Please sign in to load billing");
      return fetcher(accountId as string, accessToken);
    },
    enabled: authenticated && !!user?.id && !!accountId,
    staleTime: options.staleTime ?? BILLING_READ_TTL,
    gcTime: BILLING_READ_TTL,
    refetchOnWindowFocus: options.refetchOnWindowFocus ?? false,
    // A 4xx will not change on retry; only network and server errors are worth a second try.
    retry: (failureCount, error) => !isClientError(error) && failureCount < 2,
  });
};

export default useAccountQuery;
