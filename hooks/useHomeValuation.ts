import useCatalogs from "@/hooks/useCatalogs";
import useCatalogMeasurements from "@/hooks/useCatalogMeasurements";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { getValuationHeroState } from "@/lib/home/getValuationHeroState";
import type { CatalogValuationBand } from "@/lib/catalog/getCatalogMeasurements";

export type HomeValuationState =
  | { show: false; noStreams?: { measuredTrackCount: number } }
  | {
      show: true;
      artistName: string;
      artistImage: string;
      valuation: CatalogValuationBand;
      measuredTrackCount: number;
    };

/**
 * Composed hook behind the homepage valuation hero. The hero reads the
 * account's catalog through the measurements endpoint; with an artist
 * selected the read is scoped server-side via artist_account_id
 * (catalog_songs ∩ song_artists) and only renders when the response echoes
 * that scope — a pre-v2 api ignores the param and gets hidden instead of
 * showing whole-catalog money under an artist label. With no artist
 * selected it shows the whole catalog's value under the catalog name.
 * Auth/context come from providers per the chat hooks conventions; nothing
 * here touches the chat transport (recoupable/chat#1850).
 */
const useHomeValuation = (): HomeValuationState => {
  const { selectedArtist } = useArtistProvider();
  const selectedArtistName = selectedArtist?.name ?? null;
  const selectedArtistAccountId = selectedArtist?.account_id ?? null;

  const { data: catalogsData, isError: catalogsFailed } = useCatalogs();
  const catalog = catalogsData?.catalogs?.[0];

  // limit 1: the hero only needs the whole-scope aggregates
  // (measured_song_count + valuation), not the measurement rows.
  const { data: measurements, isError: measurementsFailed } =
    useCatalogMeasurements(
      catalog?.id,
      selectedArtistAccountId ?? undefined,
      1,
    );

  const state = getValuationHeroState({
    catalog,
    catalogsFailed,
    measurements,
    measurementsFailed,
    selectedArtistName,
    selectedArtistAccountId,
  });

  if (!state.show) return state;

  return {
    show: true,
    artistName: state.showArtist
      ? selectedArtistName || state.catalogName
      : state.catalogName,
    artistImage: state.showArtist ? selectedArtist?.image || "" : "",
    valuation: state.valuation,
    measuredTrackCount: state.measuredTrackCount,
  };
};

export default useHomeValuation;
