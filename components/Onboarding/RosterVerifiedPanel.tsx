"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import ValuationHero from "@/components/Home/ValuationHero";
import useHomeValuation from "@/hooks/useHomeValuation";
import { cn } from "@/lib/utils";

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
          This is your baseline. A weekly report re-measures it and emails you
          the trend.
        </p>
        <Link
          href="/setup/tasks"
          className={cn(buttonVariants(), "min-w-[200px]")}
        >
          Set up your weekly report
        </Link>
      </section>
    );
  }

  return (
    <section className="flex flex-col items-center gap-4 text-center py-12">
      <CheckCircle2 className="size-10 text-[#22c55e]" />
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Roster verified
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your artists and their socials are confirmed. Claim your catalog to
          see what it is worth.
        </p>
      </div>
      <Link
        href="/setup/catalog"
        className={cn(buttonVariants(), "min-w-[200px]")}
      >
        Claim your catalog
      </Link>
    </section>
  );
};

export default RosterVerifiedPanel;
