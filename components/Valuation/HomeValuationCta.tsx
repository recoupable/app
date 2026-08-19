"use client";

import useCatalogs from "@/hooks/useCatalogs";
import useRunValuation from "@/hooks/useRunValuation";
import { VALUATION_URL } from "@/lib/consts";
import RunValuationButton from "./RunValuationButton";

/**
 * The greeting's valuation CTA (chat#1973): a signed-in account with a
 * runnable roster artist and no catalog gets the one-click run in place —
 * bouncing that account to the marketing funnel made it re-enter a flow it
 * already finished. Everyone else keeps the funnel link.
 */
const HomeValuationCta = () => {
  const { canRun } = useRunValuation();
  const { data } = useCatalogs();
  const hasNoCatalog = !!data && (data.catalogs?.length ?? 0) === 0;

  if (canRun && hasNoCatalog) return <RunValuationButton />;

  return (
    <a
      href={VALUATION_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-full bg-card px-4 py-2 text-sm font-normal text-muted-foreground shadow-[0px_0px_0px_1px_var(--border)] transition-colors hover:text-foreground"
    >
      Get a free catalog valuation &rarr;
    </a>
  );
};

export default HomeValuationCta;
