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
  selectedArtistAccountId: string | null;
}

export type ValuationHeroState =
  | { show: false; noStreams?: { measuredTrackCount: number } }
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
 * (catalog label). With an artist selected the api scopes the read via
 * artist_account_id and the hero only renders when the response ECHOES that
 * exact scope — a pre-v2 deployment ignores the unknown param and returns
 * whole-catalog numbers without the echo, which must never appear under an
 * artist's name. Visibility and the track count come from the whole-scope
 * measured_song_count aggregate, never the returned page: zero (nothing
 * measured in scope) or absent (pre-v2 shape, numbers from a capped read)
 * hides the hero, as does any missing or failed input, so the homepage
 * falls back to the chat greeting with zero regression (recoupable/chat#1850).
 */
export function getValuationHeroState({
  catalog,
  catalogsFailed,
  measurements,
  measurementsFailed,
  selectedArtistName,
  selectedArtistAccountId,
}: GetValuationHeroStateParams): ValuationHeroState {
  if (catalogsFailed || measurementsFailed) return { show: false };

  if (!catalog) return { show: false };

  if (!measurements?.valuation) return { show: false };

  if (!measurements.measured_song_count) return { show: false };

  // Measured fine, zero plays (chat#1969): a $0 band is not a valuation. Hide
  // the hero and say why, so /setup/valuation can render its honest zero state.
  // Only an explicit 0 counts; an absent total_streams is the pre-v2 shape.
  if (measurements.total_streams === 0) {
    return {
      show: false,
      noStreams: { measuredTrackCount: measurements.measured_song_count },
    };
  }

  if (
    selectedArtistAccountId &&
    measurements.artist_account_id !== selectedArtistAccountId
  ) {
    return { show: false };
  }

  return {
    show: true,
    showArtist: !!selectedArtistAccountId && !!selectedArtistName,
    catalogName: catalog.name,
    valuation: measurements.valuation,
    measuredTrackCount: measurements.measured_song_count,
  };
}
