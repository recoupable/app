export type SetupValuationStatus = "loading" | "redirect" | "measuring" | "ready";

interface SetupValuationStatusInput {
  catalogsPending: boolean;
  catalogsFailed: boolean;
  hasCatalog: boolean;
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
  catalogsPending,
  catalogsFailed,
  hasCatalog,
  valuationReady,
}: SetupValuationStatusInput): SetupValuationStatus {
  if (catalogsPending) return "loading";
  if (catalogsFailed || !hasCatalog) return "redirect";
  return valuationReady ? "ready" : "measuring";
}
