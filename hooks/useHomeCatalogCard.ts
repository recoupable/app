import useCatalogs from "@/hooks/useCatalogs";
import useCatalogMeasurements from "@/hooks/useCatalogMeasurements";
import {
  getHomeCatalogCardState,
  type HomeCatalogCardState,
} from "@/lib/home/getHomeCatalogCardState";

/**
 * Composed hook behind the chat-home claimed-catalog card
 * (recoupable/chat#1867). Reads the account's first claimed catalog and
 * its whole-catalog measurement aggregates through the same provider-backed
 * hooks the valuation hero uses (react-query dedupes by key), always
 * unscoped: the card labels its numbers by catalog name, so no artist
 * scope echo is involved. limit 1 keeps the read to the aggregates.
 */
const useHomeCatalogCard = (): HomeCatalogCardState => {
  const { data: catalogsData, isError: catalogsFailed } = useCatalogs();
  const catalog = catalogsData?.catalogs?.[0];

  const { data: measurements, isError: measurementsFailed } =
    useCatalogMeasurements(catalog?.id, undefined, 1);

  return getHomeCatalogCardState({
    catalog,
    catalogsFailed,
    measurements,
    measurementsFailed,
  });
};

export default useHomeCatalogCard;
