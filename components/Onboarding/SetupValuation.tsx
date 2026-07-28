"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ValuationHero from "@/components/Home/ValuationHero";
import useCatalogs from "@/hooks/useCatalogs";
import useHomeValuation from "@/hooks/useHomeValuation";
import { cn } from "@/lib/utils";

/**
 * `/setup/valuation` — the welcome email's payoff link. Renders the account's
 * baseline valuation with the shared homepage hero (chat#1889); the route used
 * to be a bare redirect to `/catalogs`, so the email's "See your baseline
 * valuation" link had no real destination.
 *
 * Falls back to `/catalogs` only when the account has no catalog to value, so a
 * cold-start signup still lands somewhere actionable rather than on an empty
 * hero.
 */
const SetupValuation = () => {
  const router = useRouter();
  const valuation = useHomeValuation();
  // `isPending`, not `isLoading`: useCatalogs is `enabled: !!accountId &&
  // authenticated`, and a disabled TanStack Query v5 query reports
  // isPending true / isFetching false — so isLoading is false while Privy is
  // still resolving. Redirecting on that bounced every cold load of this
  // route, which is exactly where the welcome email's payoff link points.
  const { data, isPending, isError } = useCatalogs();
  const hasCatalog = !!data?.catalogs?.length;

  useEffect(() => {
    if (isPending) return;
    if (!hasCatalog || isError) router.replace("/catalogs");
  }, [isPending, hasCatalog, isError, router]);

  if (isPending) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-6 py-8">
        <Skeleton className="h-8 w-1/2 rounded-lg" />
        <Skeleton className="h-[168px] w-full rounded-xl" />
      </div>
    );
  }

  // A catalog exists but has no valuation yet. Seeding (chat#1889 row 8)
  // creates the catalog seconds after the first artist is added and its
  // measurements land later, so this window is routine. The redirect above
  // cannot fire (there IS a catalog) and the hero cannot render, so without a
  // terminal state here the route is a skeleton with no exit.
  if (!valuation.show) {
    return (
      <section className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 px-6 py-8 text-center">
        <h1 className="text-2xl font-semibold text-foreground">
          Measuring your catalog
        </h1>
        <p className="text-sm text-muted-foreground">
          We are pulling play counts for every track. This usually takes a
          minute. Your baseline value appears here as soon as it is ready.
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
