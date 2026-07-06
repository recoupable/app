import type {
  CatalogMeasurementsResponse,
  CatalogValuationBand,
} from "@/lib/catalog/getCatalogMeasurements";
import type { Catalog } from "@/types/Catalog";

interface GetValuationHeroStateParams {
  catalogs: Catalog[] | undefined;
  catalogsFailed: boolean;
  measurements: CatalogMeasurementsResponse | undefined;
  measurementsFailed: boolean;
}

export type ValuationHeroState =
  | { show: false }
  | {
      show: true;
      catalogName: string;
      valuation: CatalogValuationBand;
      measuredTrackCount: number;
    };

/**
 * Decides whether the homepage valuation hero can render. Any missing or
 * failed input hides the hero so the homepage falls back to the current
 * chat greeting with zero regression (recoupable/chat#1850).
 */
export function getValuationHeroState({
  catalogs,
  catalogsFailed,
  measurements,
  measurementsFailed,
}: GetValuationHeroStateParams): ValuationHeroState {
  if (catalogsFailed || measurementsFailed) return { show: false };

  const catalog = catalogs?.[0];
  if (!catalog) return { show: false };

  if (!measurements?.valuation) return { show: false };

  return {
    show: true,
    catalogName: catalog.name,
    valuation: measurements.valuation,
    measuredTrackCount: measurements.measurements?.length ?? 0,
  };
}
