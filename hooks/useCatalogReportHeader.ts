import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { useUserProvider } from "@/providers/UserProvder";
import { useOrganization } from "@/providers/OrganizationProvider";
import { getCatalogs } from "@/lib/catalog/getCatalogs";
import useCatalogReportSongs from "./useCatalogReportSongs";

/** Header identity is independent of whether a measurement report is ready. */
export function useCatalogReportHeader(catalogId: string) {
  const { ready, authenticated, user, getAccessToken } = usePrivy();
  const { userData } = useUserProvider();
  const { selectedOrgId, isInitialized } = useOrganization();
  const accountId = userData?.account_id;
  const enabled = Boolean(ready && authenticated && accountId && isInitialized);
  const catalogs = useQuery({
    queryKey: [
      "catalog-report-header",
      user?.id,
      accountId,
      selectedOrgId,
      catalogId,
    ],
    queryFn: async () => {
      const token = await getAccessToken();
      if (!token || !accountId) throw new Error("Authentication required");
      return getCatalogs(accountId, token);
    },
    enabled: enabled && !!catalogId,
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });
  const catalog =
    enabled && catalogs.isSuccess && !catalogs.isFetching
      ? catalogs.data.catalogs.find(
          (entry) =>
            entry.id === catalogId &&
            entry.owner?.id === (selectedOrgId ?? accountId),
        )
      : undefined;
  // Share the report's bounded first page, never traverse pages to count songs.
  const songs = useCatalogReportSongs(catalogId, !!catalog);
  const total = songs.data?.pagination?.total_count;
  const totalSongs =
    catalog &&
    songs.isSuccess &&
    !songs.isFetching &&
    typeof total === "number" &&
    Number.isSafeInteger(total) &&
    total >= 0
      ? total
      : undefined;

  return { catalogName: catalog?.name, totalSongs };
}
