"use client";

import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import useArtistCatalogSongs from "@/hooks/useArtistCatalogSongs";
import CatalogOwnerAvatar from "./CatalogOwnerAvatar";
import CatalogValue from "./CatalogValue";
import type { Catalog } from "@/types/Catalog";

interface CatalogCardProps {
  catalog: Catalog;
}

const CatalogCard = ({ catalog }: CatalogCardProps) => {
  const { data, isLoading } = useArtistCatalogSongs({
    catalogId: catalog.id,
    pageSize: 1,
  });

  const songCount = data?.pages[0]?.pagination?.total_count ?? 0;

  // A link, not a button: the card is navigation, and `button` only permits
  // phrasing content — the value and owner rows below are flow content.
  return (
    <Link
      href={`/catalogs/${catalog.id}`}
      className="block w-full text-left p-4 border rounded-lg hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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

      <CatalogValue catalog={catalog} />

      <div className="mt-3 flex items-end justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Created: {new Date(catalog.created_at).toLocaleDateString()}
        </p>
        {catalog.owner ? <CatalogOwnerAvatar owner={catalog.owner} /> : null}
      </div>
    </Link>
  );
};

export default CatalogCard;
