"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import useCatalogs from "@/hooks/useCatalogs";
import useArtistCatalogSongs from "@/hooks/useArtistCatalogSongs";

interface CatalogLandingHeaderProps {
  catalogId: string;
}

/**
 * Landing header for a catalog deep-link (e.g. a warm lead arriving from a
 * marketing valuation). Shows the catalog name, how many tracks it holds, and
 * a single clear next action — open the agent pre-asked about this catalog —
 * so the work the lead just did has an obvious continuation.
 */
const CatalogLandingHeader = ({ catalogId }: CatalogLandingHeaderProps) => {
  const { data: catalogsData } = useCatalogs();
  const catalog = catalogsData?.catalogs?.find((c) => c.id === catalogId);

  const { data, isLoading } = useArtistCatalogSongs({
    catalogId,
    pageSize: 1,
  });
  const trackCount = data?.pages?.[0]?.pagination?.total_count ?? 0;

  const name = catalog?.name ?? "Your catalog";
  const prompt = `Tell me about my catalog "${name}" — what stands out across these tracks, and what should I do next?`;

  return (
    <div className="rounded-xl bg-card shadow p-5 mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-lg md:text-xl font-semibold truncate">{name}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isLoading ? (
            <Skeleton className="h-4 w-24" />
          ) : (
            <>
              {trackCount} {trackCount === 1 ? "track" : "tracks"} in this catalog
            </>
          )}
        </p>
      </div>
      <Button asChild className="shrink-0">
        <Link href={`/?q=${encodeURIComponent(prompt)}`}>
          <Sparkles />
          Ask the agent about this catalog
        </Link>
      </Button>
    </div>
  );
};

export default CatalogLandingHeader;
