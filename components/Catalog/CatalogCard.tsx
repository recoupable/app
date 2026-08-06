"use client";

import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import useArtistCatalogSongs from "@/hooks/useArtistCatalogSongs";
import { formatValuationAmount } from "@/lib/catalog/formatValuationAmount";
import CatalogOwnerAvatar from "./CatalogOwnerAvatar";
import type { Catalog } from "@/types/Catalog";

interface CatalogCardProps {
  catalog: Catalog;
}

const CatalogCard = ({ catalog }: CatalogCardProps) => {
  const router = useRouter();
  const { data, isLoading } = useArtistCatalogSongs({
    catalogId: catalog.id,
    pageSize: 1,
  });

  const songCount = data?.pages[0]?.pagination?.total_count ?? 0;
  const valuation = catalog.valuation;

  const handleCatalogClick = () => {
    router.push(`/catalogs/${catalog.id}`);
  };

  return (
    <button
      type="button"
      onClick={handleCatalogClick}
      className="w-full text-left p-4 border rounded-lg hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      <h2 className="font-semibold text-base">{catalog.name}</h2>
      <p className="text-sm text-muted-foreground mt-1">
        {isLoading ? (
          <Skeleton className="h-5 w-20" />
        ) : (
          <>
            {songCount} {songCount === 1 ? "song" : "songs"}
          </>
        )}
      </p>

      {/* The number is the reason to scan this page. An unmeasured catalog has
          no band — say so, rather than imply it is worth $0. */}
      <p className="mt-3 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
        Estimated value
      </p>
      {valuation ? (
        <p className="font-semibold text-xl leading-tight">
          {formatValuationAmount(valuation.mid)}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">Not measured yet</p>
      )}

      <div className="mt-3 flex items-end justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Created: {new Date(catalog.created_at).toLocaleDateString()}
        </p>
        {catalog.owner ? <CatalogOwnerAvatar owner={catalog.owner} /> : null}
      </div>
    </button>
  );
};

export default CatalogCard;
