"use client";

import { formatValuationAmount } from "@/lib/catalog/formatValuationAmount";
import type { Catalog } from "@/types/Catalog";

export interface CatalogValueProps {
  catalog: Catalog;
}

/**
 * What a catalog is worth, as shown on a card.
 *
 * Three distinct states, because collapsing them misleads:
 * - **not measured** — no songs have play counts, so there is no band. The api
 *   sends `valuation: null` for this; saying "$0" would imply worthlessness.
 * - **under a dollar** — a real band that rounds to $0 (a one-song catalog with
 *   a handful of streams does this). Shown as "< $1" so it reads as a small
 *   number rather than a broken one.
 * - **a value** — the band's midpoint, formatted with the same compact
 *   formatter the report page uses, so a card and the report agree on sight.
 */
const CatalogValue = ({ catalog }: CatalogValueProps) => {
  const measured = (catalog.measured_song_count ?? 0) > 0;
  const valuation = measured ? catalog.valuation : null;

  return (
    <>
      <p className="mt-3 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
        Estimated value
      </p>
      {valuation ? (
        <p className="font-semibold text-xl leading-tight">
          {valuation.mid < 1 ? "< $1" : formatValuationAmount(valuation.mid)}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">Not measured yet</p>
      )}
    </>
  );
};

export default CatalogValue;
