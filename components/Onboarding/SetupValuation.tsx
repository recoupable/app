"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ValuationHero from "@/components/Home/ValuationHero";
import MeasuringCatalogPanel from "@/components/Onboarding/MeasuringCatalogPanel";
import ZeroStreamsPanel from "@/components/Onboarding/ZeroStreamsPanel";
import useSetupValuation from "@/hooks/useSetupValuation";
import { cn } from "@/lib/utils";

/**
 * `/setup/valuation` — the welcome email's payoff link. Renders the account's
 * baseline valuation with the shared homepage hero (chat#1889); the route used
 * to be a bare redirect to `/catalogs`, so the email's "See your baseline
 * valuation" link had no real destination.
 *
 * Status, the redirect for accounts with no catalog, and the measuring poll all
 * live in `useSetupValuation`; this renders what the status describes.
 */
const SetupValuation = () => {
  const { status, valuation } = useSetupValuation();

  if (status === "loading" || status === "redirect") {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-6 py-8">
        <Skeleton className="h-8 w-1/2 rounded-lg" />
        <Skeleton className="h-[168px] w-full rounded-xl" />
      </div>
    );
  }

  // Measured with zero plays: a terminal answer, never "measuring" (chat#1969).
  if (status === "no_streams") {
    return (
      <ZeroStreamsPanel
        measuredTrackCount={!valuation.show ? valuation.noStreams?.measuredTrackCount : undefined}
      />
    );
  }

  // A catalog exists but has no valuation yet: routine while a seeded
  // valuation is still measuring (chat#1889 row 8). The hook polls it out.
  if (status === "measuring" || !valuation.show) return <MeasuringCatalogPanel />;

  return (
    <section className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 px-6 py-8">
      <ValuationHero
        artistName={valuation.artistName}
        artistImage={valuation.artistImage}
        valuation={valuation.valuation}
        measuredTrackCount={valuation.measuredTrackCount}
      />
      <p className="text-center text-sm text-muted-foreground">
        This estimate goes stale the day you close the tab. A weekly report
        re-measures your catalog and emails you the trend.
      </p>
      <Link
        href="/setup/tasks"
        className={cn(buttonVariants(), "min-w-[200px]")}
      >
        Set up your weekly report
      </Link>
    </section>
  );
};

export default SetupValuation;
