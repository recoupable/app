/**
 * One description of one wait.
 *
 * The minute between seeding a catalog and its measurements landing is shown on
 * three chat surfaces — the `/setup/artists` seeding toast, `/setup/valuation`,
 * and the `/catalogs/{id}` report — and each had drifted into its own wording
 * and its own time estimate ("a minute", "about a minute", "a minute or two").
 * The estimate a customer is given should not depend on which surface they
 * happen to be looking at (chat#1912 row 10).
 *
 * Marketing keeps its own copy of these strings, since it is a separate
 * deployment; the contract is that the text matches, not that the module is
 * imported across repos.
 */
export const MEASURING_TITLE = "Measuring your catalog";

/** The single source for how long this takes. Change it here, nowhere else. */
export const MEASURING_ESTIMATE =
  "This usually takes about a minute, and longer for large catalogs.";

export const MEASURING_BODY = `We are pulling live play counts for every track. ${MEASURING_ESTIMATE}`;

/** Seeding runs in the background, so its toast uses the same verb as the pages. */
export const measuringToastLoading = (artistName: string) =>
  `Measuring ${artistName}'s catalog…`;

export const MEASURING_TOAST_SUCCESS = "Your catalog is ready";

export const MEASURING_TOAST_ERROR =
  "Couldn't measure the catalog automatically, you can claim it later";
