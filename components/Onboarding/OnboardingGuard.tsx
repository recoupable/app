"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUserProvider } from "@/providers/UserProvder";
import { useArtistProvider } from "@/providers/ArtistProvider";
import useAccountOrganizations from "@/hooks/useAccountOrganizations";
import { needsOnboarding, OnboardingStatus } from "@/lib/onboarding";

/**
 * OnboardingGuard component that redirects new org users to /onboarding
 * if they haven't completed onboarding yet.
 *
 * Conditions for redirect:
 * 1. User has at least one organization
 * 2. onboarding_status.completed !== true
 * 3. Organization has at least one artist
 * 4. Not already on /onboarding route
 */
const OnboardingGuard = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { userData } = useUserProvider();
  const { artists, isLoading: artistsLoading } = useArtistProvider();
  const { data: organizations, isLoading: orgsLoading } =
    useAccountOrganizations();
  const hasChecked = useRef(false);

  useEffect(() => {
    // Skip if data is still loading
    if (orgsLoading || artistsLoading) {
      return;
    }

    // Skip if no userData yet
    if (!userData) {
      return;
    }

    // Skip if already on onboarding route
    if (pathname?.startsWith("/onboarding")) {
      return;
    }

    // Skip if already checked this session (to prevent redirect loops)
    if (hasChecked.current) {
      return;
    }

    // Parse onboarding_status from userData
    const onboardingStatus = userData.onboarding_status as
      | OnboardingStatus
      | null
      | undefined;

    // Check if org has artists
    const orgHasArtists = artists && artists.length > 0;

    const shouldRedirect = needsOnboarding({
      onboardingStatus,
      organizations,
      orgHasArtists,
    });

    // Mark as checked to prevent re-checking
    hasChecked.current = true;

    if (shouldRedirect) {
      router.push("/onboarding");
    }
  }, [
    userData,
    organizations,
    artists,
    orgsLoading,
    artistsLoading,
    pathname,
    router,
  ]);

  return <>{children}</>;
};

export default OnboardingGuard;
