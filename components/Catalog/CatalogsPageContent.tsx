"use client";

import useCatalogs from "@/hooks/useCatalogs";
import CatalogCard from "./CatalogCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserProvider } from "@/providers/UserProvder";
import { useOrganization } from "@/providers/OrganizationProvider";
import useAccountOrganizations from "@/hooks/useAccountOrganizations";
import { filterCatalogsByOrg } from "@/lib/catalog/filterCatalogsByOrg";
import { getCatalogsEmptyCopy } from "@/lib/catalog/getCatalogsEmptyCopy";

const CatalogsPageContent = () => {
  const { data, isLoading, error } = useCatalogs();
  const { userData } = useUserProvider();
  const { selectedOrgId } = useOrganization();
  const { data: organizations } = useAccountOrganizations();
  const accountId = userData?.account_id || "";

  if (isLoading || !accountId) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="p-4 border rounded-lg">
            <Skeleton className="h-6 w-3/4 mb-3" />
            <Skeleton className="h-5 w-20 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-500">
        {error instanceof Error ? error.message : "Failed to load catalogs"}
      </p>
    );
  }

  // Scoped here, not in `useCatalogs`: that hook is also the "does this account
  // own a catalog" signal for onboarding and first-artist seeding, so an empty
  // org must not read as an account with no catalogs (chat#1943).
  const catalogs = filterCatalogsByOrg(data?.catalogs || [], selectedOrgId);

  if (!catalogs.length) {
    const orgName = organizations?.find(
      (organization) => organization.organization_id === selectedOrgId,
    )?.organization_name;

    return (
      <p className="text-sm text-muted-foreground">
        {getCatalogsEmptyCopy(selectedOrgId, orgName)}
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {catalogs.map((catalog) => (
        <CatalogCard key={catalog.id} catalog={catalog} />
      ))}
    </div>
  );
};

export default CatalogsPageContent;
