import Link from "next/link";
import { formatValuationAmount } from "@/lib/catalog/formatValuationAmount";
import type { CatalogValuationBand } from "@/lib/catalog/getCatalogMeasurements";

interface CatalogCardProps {
  catalogId: string;
  catalogName: string;
  valuation: CatalogValuationBand | null;
  measuredTrackCount: number | null;
}

/**
 * Chat-home card for the account's claimed catalog (recoupable/chat#1867):
 * replaces the circular marketing valuation link once a catalog exists,
 * linking into the in-app catalog instead. Dollar figures render only when
 * the measurements read was trustworthy; otherwise the card stays honest
 * with name + link. Styling per DESIGN.md: shadow-as-border, achromatic
 * chrome.
 */
const CatalogCard = ({
  catalogId,
  catalogName,
  valuation,
  measuredTrackCount,
}: CatalogCardProps) => (
  <Link
    href={`/catalogs/${catalogId}`}
    aria-label={`View your claimed catalog ${catalogName}`}
    className="block w-full rounded-xl bg-card p-5 text-left shadow-[0px_0px_0px_1px_var(--border),0px_2px_4px_rgba(0,0,0,0.04)] transition-colors hover:bg-muted dark:shadow-[0px_0px_0px_1px_var(--border),0px_2px_4px_rgba(0,0,0,0.2)]"
  >
    <span className="text-xs uppercase tracking-[0.05em] text-muted-foreground">
      Your claimed catalog
    </span>
    <p className="mt-1 font-heading text-lg font-semibold text-foreground">
      {catalogName}
    </p>
    {valuation ? (
      <>
        <p className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground tabular-nums">
          {formatValuationAmount(valuation.mid)}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Range {formatValuationAmount(valuation.low)} to{" "}
          {formatValuationAmount(valuation.high)}
          {measuredTrackCount
            ? ` · ${measuredTrackCount} ${
                measuredTrackCount === 1 ? "track" : "tracks"
              } measured`
            : ""}
        </p>
      </>
    ) : null}
    <span className="mt-3 inline-block text-sm font-medium text-foreground">
      View your catalog &rarr;
    </span>
  </Link>
);

export default CatalogCard;
