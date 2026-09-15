"use client";

import useAccountOrganizations from "@/hooks/useAccountOrganizations";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { useOrganization } from "@/providers/OrganizationProvider";

/** An empty organization is a usable workspace, not unfinished onboarding. */
export function useEmptyOrganization(): boolean {
  const { selectedOrgId, isInitialized } = useOrganization();
  const memberships = useAccountOrganizations();
  const { artists, isLoading, isError } = useArtistProvider();
  return (
    !!selectedOrgId &&
    memberships.isSuccess &&
    !!memberships.data?.some((org) => org.organization_id === selectedOrgId) &&
    isInitialized &&
    !isLoading &&
    !isError &&
    artists.length === 0
  );
}
