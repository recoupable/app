import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";

type Fetcher<T> = (accountId: string, accessToken: string) => Promise<T>;

/** The shared shape of the billing reads: one key per account, Privy bearer, a minute of freshness. */
const useAccountQuery = <T>(
  key: string,
  accountId: string | undefined,
  fetcher: Fetcher<T>,
  options: { refetchOnWindowFocus?: boolean; retry?: boolean } = {},
): UseQueryResult<T> => {
  const { getAccessToken, authenticated } = usePrivy();
  return useQuery({
    queryKey: [key, accountId],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("Please sign in to load billing");
      return fetcher(accountId as string, accessToken);
    },
    enabled: authenticated && !!accountId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: options.refetchOnWindowFocus ?? true,
    retry: options.retry ?? 3,
  });
};

export default useAccountQuery;
