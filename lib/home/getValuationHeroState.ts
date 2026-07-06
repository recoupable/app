import type {
  CatalogMeasurementsResponse,
  CatalogValuationBand,
} from "@/lib/catalog/getCatalogMeasurements";
import type { Catalog } from "@/types/Catalog";

interface GetValuationHeroStateParams {
  catalog: Catalog | undefined;
  catalogsFailed: boolean;
  measurements: CatalogMeasurementsResponse | undefined;
  measurementsFailed: boolean;
  selectedArtistName: string | null;
  artistSongCount: number | undefined;
  artistMatchFailed: boolean;
}

export type ValuationHeroState =
  | { show: false }
  | {
      show: true;
      showArtist: boolean;
      catalogName: string;
      valuation: CatalogValuationBand;
      measuredTrackCount: number;
    };

/**
 * Decides whether the homepage valuation hero can render, and under which
 * label. With no artist selected the hero shows the whole catalog's value
 * (catalog label). With an artist selected it only shows once the artist is
 * confirmed to have songs in the catalog (`artistSongCount > 0`) — never the
 * wrong artist over another catalog's money. Any missing, unresolved, or
 * failed input hides the hero so the homepage falls back to the chat
 * greeting with zero regression (recoupable/chat#1850).
 */
export function getValuationHeroState({
  catalog,
  catalogsFailed,
  measurements,
  measurementsFailed,
  selectedArtistName,
  artistSongCount,
  artistMatchFailed,
}: GetValuationHeroStateParams): ValuationHeroState {
  if (catalogsFailed || measurementsFailed) return { show: false };

  if (!catalog) return { show: false };

  if (!measurements?.valuation) return { show: false };

  if (selectedArtistName) {
    if (artistMatchFailed) return { show: false };
    if (!artistSongCount) return { show: false };
  }

  return {
    show: true,
    showArtist: !!selectedArtistName,
    catalogName: catalog.name,
    valuation: measurements.valuation,
    measuredTrackCount: measurements.measurements?.length ?? 0,
  };
}
