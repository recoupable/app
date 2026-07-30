export type CatalogReportState =
  | "loading"
  | "signed-out"
  | "measuring"
  | "other-account"
  | "error"
  | "ready";

interface CatalogReportStateInput {
  isAuthenticated: boolean;
  isLoading: boolean;
  hasMeasurements: boolean;
  error: Error | null;
  /** Whether this catalog appears in the viewer's own catalog list. */
  ownsCatalog: boolean;
}

const isMissing = (error: Error | null) =>
  error === null || error.message.includes("404");

/**
 * Decides what the report tab should render.
 *
 * Measurements are account-scoped while the catalog itself is not, so a 404
 * means two different things depending on who is asking: for the owner the
 * measurement simply has not landed yet, and for anyone else the catalog was
 * measured by another account. Collapsing both into "no valuation found" is
 * what sent a customer back to recoupable.dev to re-run a valuation that was
 * already running (chat#1912 row 1).
 *
 * A disabled query (anonymous visitor) leaves neither data nor error behind,
 * which is why the auth check precedes the error checks — otherwise "not
 * signed in" surfaces as "something went wrong".
 */
export function getCatalogReportState({
  isAuthenticated,
  isLoading,
  hasMeasurements,
  error,
  ownsCatalog,
}: CatalogReportStateInput): CatalogReportState {
  if (isLoading) return "loading";
  if (!isAuthenticated) return "signed-out";
  if (hasMeasurements) return "ready";
  if (!isMissing(error)) return "error";
  return ownsCatalog ? "measuring" : "other-account";
}
