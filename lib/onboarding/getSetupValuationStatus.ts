export type SetupValuationStatus = "loading" | "redirect" | "measuring" | "ready";

interface SetupValuationStatusInput {
  /** The roster loads asynchronously; empty-while-loading is not "no artists". */
  artistsPending: boolean;
  catalogsPending: boolean;
  catalogsFailed: boolean;
  hasCatalog: boolean;
  /** Seeding fires on the first artist add, so an artist means a catalog is coming. */
  hasArtists: boolean;
  valuationReady: boolean;
}

/**
 * What `/setup/valuation` should render.
 *
 * `catalogsPending` is checked first because a pending list is not the same as
 * an empty one: `useCatalogs` is `enabled: !!accountId && authenticated`, and a
 * disabled TanStack v5 query reports isPending true / isFetching false. Reading
 * that as "no catalog" redirected signups away from the payoff page mid-load.
 *
 * "measuring" is the state that matters here: seeding creates the catalog
 * seconds after the first artist is added and its measurements land later, so
 * this route must poll its way out rather than strand the signup on static
 * text (chat#1912 row 9).
 */
export function getSetupValuationStatus({
  artistsPending,
  catalogsPending,
  catalogsFailed,
  hasCatalog,
  hasArtists,
  valuationReady,
}: SetupValuationStatusInput): SetupValuationStatus {
  if (catalogsPending || artistsPending) return "loading";
  if (catalogsFailed) return "redirect";
  // Seeding creates the catalog only after the measurements land, ~15s after
  // the artist is added. Redirecting on an empty list during that window sent a
  // signup who followed the flow to an empty /catalogs, which is a worse dead
  // end than the static panel this row set out to fix.
  if (!hasCatalog) return hasArtists ? "measuring" : "redirect";
  return valuationReady ? "ready" : "measuring";
}
