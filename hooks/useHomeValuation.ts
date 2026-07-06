import useCatalogs from "@/hooks/useCatalogs";
import useCatalogMeasurements from "@/hooks/useCatalogMeasurements";
import { useArtistProvider } from "@/providers/ArtistProvider";
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
 * Composed hook behind the homepage valuation hero: account catalogs
 * (existing endpoint) -> latest measurements + valuation band (new
 * endpoint), plus artist identity from the provider. Auth/context come
 * from providers per the chat hooks conventions; nothing here touches
 * the chat transport.
 */
const useHomeValuation = (): HomeValuationState => {
  const { data: catalogsData, isError: catalogsFailed } = useCatalogs();
  const catalogs = catalogsData?.catalogs;
  const { data: measurements, isError: measurementsFailed } =
    useCatalogMeasurements(catalogs?.[0]?.id);
  const { selectedArtist } = useArtistProvider();

  const state = getValuationHeroState({
    catalogs,
    catalogsFailed,
    measurements,
    measurementsFailed,
  });

  if (!state.show) return { show: false };

  return {
    show: true,
    artistName: selectedArtist?.name || state.catalogName,
    artistImage: selectedArtist?.image || "",
    valuation: state.valuation,
    measuredTrackCount: state.measuredTrackCount,
  };
};

export default useHomeValuation;
