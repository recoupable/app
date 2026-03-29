import { AccountOrganization } from "@/hooks/useAccountOrganizations";

/**
 * OnboardingStatus structure stored in account_info.onboarding_status
 */
export interface OnboardingStatus {
  completed?: boolean;
  completedAt?: string;
}

/**
 * Parameters for needsOnboarding check
 */
export interface NeedsOnboardingParams {
  /** The user's onboarding_status from account_info */
  onboardingStatus: OnboardingStatus | null | undefined;
  /** List of organizations the user belongs to */
  organizations: AccountOrganization[] | undefined;
  /** Whether the org has artists (checked separately) */
  orgHasArtists: boolean;
}

/**
 * Determines if a user needs to go through onboarding.
 *
 * A user needs onboarding if ALL of the following are true:
 * 1. User has at least one organization
 * 2. onboarding_status.completed is not true
 * 3. The organization has at least one artist
 *
 * @param params - The parameters to check
 * @returns true if user should be redirected to onboarding
 */
export function needsOnboarding(params: NeedsOnboardingParams): boolean {
  const { onboardingStatus, organizations, orgHasArtists } = params;

  // Check 1: User must have at least one organization
  const hasOrg = organizations && organizations.length > 0;
  if (!hasOrg) {
    return false;
  }

  // Check 2: Onboarding must not be completed
  const isCompleted = onboardingStatus?.completed === true;
  if (isCompleted) {
    return false;
  }

  // Check 3: Org must have at least one artist
  if (!orgHasArtists) {
    return false;
  }

  return true;
}

export default needsOnboarding;
