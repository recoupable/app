"use client";

import useCatalogs from "@/hooks/useCatalogs";
import CatalogCard from "./CatalogCard";
import EmptyCatalogsState from "./EmptyCatalogsState";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserProvider } from "@/providers/UserProvder";

const CatalogsPageContent = () => {
  const { data, isLoading, error } = useCatalogs();
  const { userData } = useUserProvider();
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

  const catalogs = data?.catalogs || [];

  if (!catalogs.length) {
    return <EmptyCatalogsState />;
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
