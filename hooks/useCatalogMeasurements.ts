import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { useUserProvider } from "@/providers/UserProvder";
import { useOrganization } from "@/providers/OrganizationProvider";
import {
  getCatalogMeasurements,
  CatalogMeasurementsResponse,
} from "@/lib/catalog/getCatalogMeasurements";

const useCatalogMeasurements = (
  catalogId: string | undefined,
  artistAccountId?: string,
  limit?: number,
  enabled = true,
): UseQueryResult<CatalogMeasurementsResponse> => {
  const { getAccessToken, authenticated, ready, user } = usePrivy();
  const { userData } = useUserProvider();
  const { selectedOrgId, isInitialized } = useOrganization();
  const accountId = userData?.account_id;

  return useQuery({
    queryKey: [
      "catalog-measurements",
      user?.id,
      accountId,
      selectedOrgId,
      catalogId,
      artistAccountId ?? null,
      limit ?? null,
    ],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("No access token");
      return getCatalogMeasurements(
        catalogId as string,
        accessToken,
        artistAccountId,
        limit,
      );
    },
    enabled:
      enabled &&
      !!catalogId &&
      ready &&
      authenticated &&
      !!accountId &&
      isInitialized,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    // The measurements endpoint is still rolling out (chat#1850); a 404 must
    // fall back to the greeting immediately instead of retrying.
    retry: false,
  });
};

export default useCatalogMeasurements;
