"use client";

import { useEmptyOrganization } from "@/hooks/useEmptyOrganization";
import { useOrganization } from "@/providers/OrganizationProvider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useOnboardingState } from "@/hooks/useOnboardingState";
import { getSetupPathForStep } from "@/lib/onboarding/getSetupPathForStep";

/**
 * `/setup` entry gate: forwards to the step the account is actually on
 * (chat#1889). The route used to hard-redirect to `/setup/artists`, which sent
 * a signup who had already confirmed their roster back to step 1 — the derived
 * step is the source of truth, so entry points must resolve it rather than
 * assume the beginning.
 *
 * Renders a skeleton (never the first step) until every checkpoint source has
 * resolved. A confirmed empty organization can go Home without waiting for
 * catalog or task checkpoints, since artist setup is optional there.
 */
const SetupEntry = () => {
  const isEmptyOrganization = useEmptyOrganization();
  const { isInitialized } = useOrganization();
  const router = useRouter();
  const { isReady, step } = useOnboardingState();

  useEffect(() => {
    if (!isInitialized || (!isReady && !isEmptyOrganization)) return;
    router.replace(isEmptyOrganization ? "/" : getSetupPathForStep(step));
  }, [isReady, step, router, isEmptyOrganization, isInitialized]);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-6 py-8">
      <Skeleton className="h-8 w-2/3 rounded-lg" />
      <Skeleton className="h-[72px] w-full rounded-xl" />
      <Skeleton className="h-[72px] w-full rounded-xl" />
    </div>
  );
};

export default SetupEntry;
