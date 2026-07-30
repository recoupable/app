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
  /**
   * The viewer's catalog list could not be resolved, so `ownsCatalog` carries
   * no information. Distinct from `ownsCatalog: false`, which is a real answer.
   */
  ownershipUnknown: boolean;
}

/**
 * Only the status prefix decides this. `getCatalogMeasurements` throws
 * `HTTP {status}: {body}`, so a substring match would read a 500 whose body
 * mentions 404 as a missing measurement.
 */
const isMissing = (error: Error | null) =>
  error === null || /^HTTP 404\b/.test(error.message);

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
  ownershipUnknown,
}: CatalogReportStateInput): CatalogReportState {
  if (isLoading) return "loading";
  if (!isAuthenticated) return "signed-out";
  if (hasMeasurements) return "ready";
  if (!isMissing(error)) return "error";
  // Without a resolved catalog list we cannot tell an owner apart from a
  // stranger, and guessing "other-account" tells owners their own catalog
  // belongs to someone else.
  if (ownershipUnknown) return "error";
  return ownsCatalog ? "measuring" : "other-account";
}
