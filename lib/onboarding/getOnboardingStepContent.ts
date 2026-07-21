import type { OnboardingStepId } from "@/lib/onboarding/types";

export interface OnboardingStepContent {
  title: string;
  description: string;
  href: string;
  linkLabel: string;
}

const STEP_CONTENT: Record<OnboardingStepId, OnboardingStepContent> = {
  artists: {
    title: "Confirm your artists",
    description:
      "Confirm the artists you manage and add the rest of your roster so Recoup works for all of them.",
    href: "/artists",
    linkLabel: "Open your roster",
  },
  socials: {
    title: "Verify socials",
    description:
      "Check the social profiles matched to each artist so the data behind your reports is right.",
    href: "/artists",
    linkLabel: "Review artist profiles",
  },
  catalog: {
    title: "Claim your catalog",
    description:
      "Connect the catalog behind your valuation so Recoup can measure and track it over time.",
    href: "/catalogs",
    linkLabel: "Open catalogs",
  },
  task: {
    title: "Schedule your first report",
    description:
      "Set up a recurring task and Recoup will keep working your catalog every week.",
    href: "/tasks",
    linkLabel: "Open tasks",
  },
};

/**
 * Placeholder card copy for each onboarding step. Each step's full
 * experience ships in sibling PRs on recoupable/chat#1867; until then the
 * card links to the existing page where the step can be completed today.
 */
export function getOnboardingStepContent(
  step: OnboardingStepId,
): OnboardingStepContent {
  return STEP_CONTENT[step];
}
