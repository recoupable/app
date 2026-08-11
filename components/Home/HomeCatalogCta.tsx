"use client";

import CatalogCard from "@/components/Home/CatalogCard";
import useHomeCatalogCard from "@/hooks/useHomeCatalogCard";
import { VALUATION_URL } from "@/lib/consts";

/**
 * The greeting's CTA slot (recoupable/chat#1867): a claimed catalog
 * replaces the marketing valuation link — sending a signup back to the
 * funnel they just completed is circular — otherwise the link into the
 * valuation funnel stays as-is. Self-contained via provider-backed hooks
 * so the greeting needs no knowledge of which variant renders.
 */
const HomeCatalogCta = () => {
  const catalogCard = useHomeCatalogCard();

  if (catalogCard.show) {
    return (
      <div className="mb-4 mt-4 text-left text-sm font-normal tracking-normal">
        <CatalogCard
          catalogId={catalogCard.catalogId}
          catalogName={catalogCard.catalogName}
          valuation={catalogCard.valuation}
          measuredTrackCount={catalogCard.measuredTrackCount}
        />
      </div>
    );
  }

  return (
    <div className="mb-4 mt-4">
      <a
        href={VALUATION_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full bg-card px-4 py-2 text-sm font-normal text-muted-foreground shadow-[0px_0px_0px_1px_var(--border)] transition-colors hover:text-foreground"
      >
        Get a free catalog valuation &rarr;
      </a>
    </div>
  );
};

export default HomeCatalogCta;
