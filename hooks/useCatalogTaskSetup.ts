import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { z } from "zod";
import { useUserProvider } from "@/providers/UserProvder";
import { useOrganization } from "@/providers/OrganizationProvider";
import { getCatalogs } from "@/lib/catalog/getCatalogs";

/** Reauthorize the explicit catalog; never substitute a cached catalog or artist. */
export function useCatalogTaskSetup(catalogId: string | string[]) {
  const { ready, authenticated, user, getAccessToken } = usePrivy();
  const { userData } = useUserProvider();
  const { selectedOrgId, isInitialized } = useOrganization();
  const accountId = userData?.account_id;
  const validId = z.string().uuid().safeParse(catalogId).success;
  const enabled = Boolean(
    validId && ready && authenticated && accountId && isInitialized,
  );
  const query = useQuery({
    queryKey: [
      "catalog-task-setup",
      user?.id,
      accountId,
      selectedOrgId,
      catalogId,
    ],
    queryFn: async () => {
      const token = await getAccessToken();
      if (!token || !accountId) throw new Error("Authentication required");
      // This existing endpoint checks account access and current org memberships.
      return getCatalogs(accountId, token);
    },
    enabled,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    retry: false,
  });
  const retry = () => query.refetch();
  if (!validId) return { state: "invalid" as const, retry };
  if (ready && !authenticated) return { state: "sign-in" as const, retry };
  if (!enabled || query.isPending || query.isFetching)
    return { state: "loading" as const, retry };
  if (query.isError) return { state: "error" as const, retry };
  const catalog = query.data?.catalogs.find((entry) => entry.id === catalogId);
  if (!catalog) return { state: "missing" as const, retry };
  // Account-wide visibility is not permission to silently change the selected workspace.
  if (catalog.owner?.id !== (selectedOrgId ?? accountId))
    return { state: "workspace" as const, retry };
  return { state: "unsupported" as const, catalogName: catalog.name, retry };
}
