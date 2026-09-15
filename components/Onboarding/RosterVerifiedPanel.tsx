"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import ValuationHero from "@/components/Home/ValuationHero";
import useHomeValuation from "@/hooks/useHomeValuation";
import { cn } from "@/lib/utils";
import { useOnboardingState } from "@/hooks/useOnboardingState";
import { getSetupPathForStep } from "@/lib/onboarding/getSetupPathForStep";
import { getOnboardingStepTitle } from "@/lib/onboarding/getOnboardingStepTitle";

/**
 * Shown when both roster and socials steps are complete.
 *
 * Ends setup on the account's catalog valuation — the number a valuation lead
 * converted on — rather than a generic green check (chat#1889). Reuses the
 * homepage hero (`useHomeValuation` + `ValuationHero`) instead of building a
 * second valuation surface. Falls back to the confirmation state when there is
 * no valuation yet, so a cold-start account still gets a clear finish and a
 * pointer at the step that unlocks one.
 */
const RosterVerifiedPanel = () => {
  const valuation = useHomeValuation();
  const { isReady, step } = useOnboardingState();
  const nextPath = isReady ? getSetupPathForStep(step) : "/setup";
  const nextLabel = !isReady
    ? "Continue setup"
    : step === "complete"
      ? "Open chat"
      : getOnboardingStepTitle(step);

  if (valuation.show) {
    return (
      <section className="flex flex-col items-center gap-4 py-8">
        <ValuationHero
          artistName={valuation.artistName}
          artistImage={valuation.artistImage}
          valuation={valuation.valuation}
          measuredTrackCount={valuation.measuredTrackCount}
        />
        <p className="text-sm text-muted-foreground text-center">
          Your artist profiles are connected. This is your current catalog
          valuation. Continue to your next unfinished setup step, or open chat
          if you’re all set.
        </p>
        <Link href={nextPath} className={cn(buttonVariants(), "min-w-[200px]")}>
          {nextLabel}
        </Link>
      </section>
    );
  }

  return (
    <section className="flex flex-col items-center gap-4 text-center py-12">
      <CheckCircle2 className="size-10 text-[#22c55e]" />
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Artist profiles connected
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Every artist has at least one linked profile. Your saved profiles will
          be used the next time you sign in. Continue with any remaining setup
          steps below.
        </p>
      </div>
      <Link href={nextPath} className={cn(buttonVariants(), "min-w-[200px]")}>
        {nextLabel}
      </Link>
    </section>
  );
};

export default RosterVerifiedPanel;
