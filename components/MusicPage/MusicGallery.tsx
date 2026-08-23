"use client";

import { Skeleton } from "@/components/ui/skeleton";
import MusicGenerationCard from "./MusicGenerationCard";
import useMusicGenerations from "@/hooks/useMusicGenerations";
import { useOrganization } from "@/providers/OrganizationProvider";

const MusicGallery = () => {
  const { data, isLoading, error } = useMusicGenerations();
  const { selectedOrgId } = useOrganization();
  const generations = data?.generations ?? [];

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="font-heading text-xl font-bold">Your music</h2>
        {!isLoading && !error && generations.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {generations.length} {generations.length === 1 ? "song" : "songs"}
          </p>
        )}
      </div>

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <p className="text-sm text-destructive">
          Could not load your music. Refresh to try again.
        </p>
      )}

      {!isLoading && !error && generations.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {selectedOrgId
            ? "No songs generated in this organization yet."
            : "No songs yet. Generate one to get started."}
        </p>
      )}

      {!isLoading && !error && generations.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {generations.map(generation => (
            <MusicGenerationCard key={generation.id} generation={generation} />
          ))}
        </div>
      )}
    </section>
  );
};

export default MusicGallery;
