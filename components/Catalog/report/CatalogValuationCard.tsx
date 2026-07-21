import type { CatalogValuation } from "@/lib/valuation/computeCatalogValuation";
import { formatValuationAmount } from "@/lib/catalog/formatValuationAmount";

interface CatalogValuationCardProps {
  valuation: CatalogValuation;
}

/**
 * The valuation echo: central value + range, mirroring the marketing
 * valuation card so the number a signup just saw is the number they land on.
 */
const CatalogValuationCard = ({ valuation }: CatalogValuationCardProps) => {
  return (
    <section
      aria-label="Estimated catalog value"
      className="rounded-2xl bg-card p-6 sm:p-8 shadow-[0_0_0_1px_var(--border),0_2px_4px_rgba(0,0,0,0.04)]"
    >
      <p className="text-[11px] font-heading uppercase tracking-[0.16em] text-muted-foreground">
        Estimated catalog value
      </p>
      <p className="mt-3 font-heading font-bold text-[clamp(2.5rem,7vw,4rem)] leading-[0.95] tracking-tight text-foreground">
        {formatValuationAmount(valuation.valueBand.central)}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        range {formatValuationAmount(valuation.valueBand.low)} to{" "}
        {formatValuationAmount(valuation.valueBand.high)}
      </p>
      <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
        Directional model, not an appraisal: live platform-displayed Spotify
        play counts, other platforms approximated as a labeled share of Spotify,
        annual run-rate from your catalog&apos;s lifetime average over ~
        {valuation.catalogAgeYears} years, master-side net label share × a{" "}
        {valuation.assumptions.multiple.low} to{" "}
        {valuation.assumptions.multiple.high}× market multiple. Real statements
        collapse the range.
      </p>
    </section>
  );
};

export default CatalogValuationCard;
