"use client";

import Link from "next/link";
import { getOnboardingStepContent } from "@/lib/onboarding/getOnboardingStepContent";
import type { OnboardingStepId } from "@/lib/onboarding/types";

/**
 * Placeholder card for a single onboarding step (recoupable/chat#1867).
 * Each step's full in-sequence experience ships in sibling PRs; until then
 * the card states the step's purpose and links to the existing page where
 * it can be completed today.
 */
const OnboardingStepCard = ({ step }: { step: OnboardingStepId }) => {
  const { title, description, href, linkLabel } =
    getOnboardingStepContent(step);

  return (
    <section
      aria-labelledby="onboarding-step-title"
      className="w-full rounded-xl border bg-card p-6 text-card-foreground shadow"
    >
      <h3
        id="onboarding-step-title"
        className="text-lg font-semibold text-foreground"
      >
        {title}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <Link
        href={href}
        className="mt-4 inline-block rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
      >
        {linkLabel}
      </Link>
    </section>
  );
};

export default OnboardingStepCard;
