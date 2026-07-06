import useCatalogs from "@/hooks/useCatalogs";
import useCatalogMeasurements from "@/hooks/useCatalogMeasurements";
import useCatalogSongs from "@/hooks/useCatalogSongs";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { findArtistCatalog } from "@/lib/home/findArtistCatalog";
import { getValuationHeroState } from "@/lib/home/getValuationHeroState";
import type { CatalogValuationBand } from "@/lib/catalog/getCatalogMeasurements";

export type HomeValuationState =
  | { show: false }
  | {
      show: true;
      artistName: string;
      artistImage: string;
      valuation: CatalogValuationBand;
      measuredTrackCount: number;
    };

/**
 * Composed hook behind the homepage valuation hero. The hero is
 * artist-scoped: with an artist selected it reads the catalog matched to
 * that artist and only renders once the artist verifiably has songs in it
 * (songs-by-artist count > 0), re-resolving on artist switch; with no
 * artist selected it shows the whole catalog's value under the catalog
 * name. Auth/context come from providers per the chat hooks conventions;
 * nothing here touches the chat transport (recoupable/chat#1850).
 */
const useHomeValuation = (): HomeValuationState => {
  const { selectedArtist } = useArtistProvider();
  const selectedArtistName = selectedArtist?.name ?? null;

  const { data: catalogsData, isError: catalogsFailed } = useCatalogs();
  const catalogs = catalogsData?.catalogs;
  const catalog = findArtistCatalog(catalogs, selectedArtistName);

  const { data: measurements, isError: measurementsFailed } =
    useCatalogMeasurements(catalog?.id);

  const { data: artistSongs, isError: artistMatchFailed } = useCatalogSongs({
    catalogId: catalog?.id ?? "",
    pageSize: 1,
    artistName: selectedArtistName ?? undefined,
    enabled: !!catalog?.id && !!selectedArtistName,
  });
  const artistSongCount = artistSongs?.pages?.[0]?.pagination.total_count;

  const state = getValuationHeroState({
    catalog,
    catalogsFailed,
    measurements,
    measurementsFailed,
    selectedArtistName,
    artistSongCount,
    artistMatchFailed,
  });

  if (!state.show) return { show: false };

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
