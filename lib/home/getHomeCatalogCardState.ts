import type {
  CatalogMeasurementsResponse,
  CatalogValuationBand,
} from "@/lib/catalog/getCatalogMeasurements";
import type { Catalog } from "@/types/Catalog";

interface GetHomeCatalogCardStateParams {
  catalog: Catalog | undefined;
  catalogsFailed: boolean;
  measurements: CatalogMeasurementsResponse | undefined;
  measurementsFailed: boolean;
}

export type HomeCatalogCardState =
  | { show: false }
  | {
      show: true;
      catalogId: string;
      catalogName: string;
      valuation: CatalogValuationBand | null;
      measuredTrackCount: number | null;
    };

/**
 * Decides whether the chat-home fallback (no valuation hero) shows the
 * account's claimed catalog instead of the circular marketing valuation
 * link (recoupable/chat#1867). A claimed catalog always earns the card —
 * it links into /catalogs/{id} — but the dollar figures only ride along
 * when the whole-catalog measurements read is trustworthy: a present
 * valuation band plus a nonzero whole-scope measured_song_count aggregate
 * (absent on pre-v2 deployments, whose numbers come from a capped read and
 * must not be shown). A failed or empty measurements read degrades to a
 * name-only card, never back to the marketing link.
 */
export function getHomeCatalogCardState({
  catalog,
  catalogsFailed,
  measurements,
  measurementsFailed,
}: GetHomeCatalogCardStateParams): HomeCatalogCardState {
  if (catalogsFailed || !catalog) return { show: false };

  const trustworthy =
    !measurementsFailed &&
    !!measurements?.valuation &&
    !!measurements.measured_song_count;

  return {
    show: true,
    catalogId: catalog.id,
    catalogName: catalog.name,
    valuation: trustworthy ? measurements.valuation : null,
    measuredTrackCount: trustworthy
      ? (measurements.measured_song_count ?? null)
      : null,
  };
}
