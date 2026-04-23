import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { getCatalogs, CatalogsResponse } from "@/lib/catalog/getCatalogs";
import { useUserProvider } from "@/providers/UserProvder";

const useCatalogs = (): UseQueryResult<CatalogsResponse> => {
  const { getAccessToken, authenticated } = usePrivy();
  const { userData } = useUserProvider();
  const accountId = userData?.account_id || "";

  return useQuery({
    queryKey: ["catalogs", accountId],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("No access token");
      return getCatalogs(accountId, accessToken);
    },
    enabled: !!accountId && authenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export default useCatalogs;
