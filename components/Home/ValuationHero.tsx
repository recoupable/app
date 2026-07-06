import ImageWithFallback from "@/components/ImageWithFallback";
import { formatValuationAmount } from "@/lib/catalog/formatValuationAmount";
import type { CatalogValuationBand } from "@/lib/catalog/getCatalogMeasurements";

interface ValuationHeroProps {
  artistName: string;
  artistImage: string;
  valuation: CatalogValuationBand;
  measuredTrackCount: number;
}

/**
 * Homepage hero: the estimated catalog value a valuation lead converted on
 * (recoupable/chat#1850). Card styling follows DESIGN.md: shadow-as-border,
 * achromatic chrome, display treatment on the dollar figure.
 */
const ValuationHero = ({
  artistName,
  artistImage,
  valuation,
  measuredTrackCount,
}: ValuationHeroProps) => (
  <section
    aria-label="Estimated catalog value"
    className="w-full rounded-xl bg-card p-6 shadow-[0px_0px_0px_1px_var(--border),0px_2px_4px_rgba(0,0,0,0.04)] dark:shadow-[0px_0px_0px_1px_var(--border),0px_2px_4px_rgba(0,0,0,0.2)]"
  >
    <div className="flex items-center gap-3">
      {artistImage && (
        <span className="inline-block size-10 shrink-0 overflow-hidden rounded-full ring-1 ring-foreground">
          <ImageWithFallback src={artistImage} />
        </span>
      )}
      <div className="flex flex-col">
        <span className="font-heading text-base font-semibold text-foreground">
          {artistName}
        </span>
        <span className="text-xs uppercase tracking-[0.05em] text-muted-foreground">
          Estimated catalog value
        </span>
      </div>
    </div>
    <p className="mt-4 font-heading text-5xl font-semibold tracking-tight text-foreground tabular-nums sm:text-6xl">
      {formatValuationAmount(valuation.mid)}
    </p>
    <p className="mt-2 text-sm text-muted-foreground">
      Range {formatValuationAmount(valuation.low)} to{" "}
      {formatValuationAmount(valuation.high)} &middot; {measuredTrackCount}{" "}
      {measuredTrackCount === 1 ? "track" : "tracks"} measured
    </p>
  </section>
);

export default ValuationHero;
