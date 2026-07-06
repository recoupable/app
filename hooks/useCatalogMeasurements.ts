import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import {
  getCatalogMeasurements,
  CatalogMeasurementsResponse,
} from "@/lib/catalog/getCatalogMeasurements";

const useCatalogMeasurements = (
  catalogId: string | undefined,
): UseQueryResult<CatalogMeasurementsResponse> => {
  const { getAccessToken, authenticated } = usePrivy();

  return useQuery({
    queryKey: ["catalog-measurements", catalogId],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("No access token");
      return getCatalogMeasurements(catalogId as string, accessToken);
    },
    enabled: !!catalogId && authenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    // The measurements endpoint is still rolling out (chat#1850); a 404 must
    // fall back to the greeting immediately instead of retrying.
    retry: false,
  });
};

export default useCatalogMeasurements;
