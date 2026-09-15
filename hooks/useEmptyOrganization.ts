"use client";

import { useArtistProvider } from "@/providers/ArtistProvider";
import { useOrganization } from "@/providers/OrganizationProvider";

/** An empty organization is a usable workspace, not unfinished onboarding. */
export function useEmptyOrganization(): boolean {
  const { selectedOrgId, isInitialized } = useOrganization();
  const { artists, isLoading, isError } = useArtistProvider();
  return (
    !!selectedOrgId &&
    isInitialized &&
    !isLoading &&
    !isError &&
    artists.length === 0
  );
}
