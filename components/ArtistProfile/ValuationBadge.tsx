import { formatUsdBand } from "@/lib/valuation/formatUsdEstimate";
import type { ArtistProfileValuation } from "@/lib/recoup/getArtistProfile";

/**
 * The hero's estimated-catalog-value band, from the published Recoup
 * valuation model. Rendered only when the artist has measured songs.
 */
const ValuationBadge = ({ valuation }: { valuation: ArtistProfileValuation }) => (
  <div className="flex items-baseline justify-center gap-2.5 md:justify-start">
    <span className="font-mono text-xl font-bold tracking-tight md:text-[26px]">
      {formatUsdBand(valuation)}
    </span>
    <span className="text-xs text-muted-foreground md:text-[13px]">est. catalog value</span>
  </div>
);

export default ValuationBadge;
