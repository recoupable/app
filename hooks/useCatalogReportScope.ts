import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { useUserProvider } from "@/providers/UserProvder";
import { useOrganization } from "@/providers/OrganizationProvider";
import { getCatalogs } from "@/lib/catalog/getCatalogs";

/** Fresh catalog authority shared by the header and every report-body read. */
export function useCatalogReportScope(catalogId: string) {
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
  const state =
    ready && !authenticated
      ? ("signed-out" as const)
      : !enabled || catalogs.isPending || catalogs.isFetching
        ? ("loading" as const)
        : catalogs.isError
          ? ("error" as const)
          : !catalog
            ? ("unavailable" as const)
            : ("authorized" as const);
  return {
    catalog,
    state,
    hasOwnCatalogs:
      state === "authorized" && catalogs.data!.catalogs.length > 0,
  };
}
