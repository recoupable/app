import type { CatalogReportState } from "./getCatalogReportState";
import { MEASURING_BODY, MEASURING_TITLE } from "./measuringCopy";

export type CatalogReportEmptyState =
  | Exclude<CatalogReportState, "loading" | "ready">
  // Measured fine, zero plays: not a load/auth state, decided by the report
  // body itself (chat#1969).
  | "no_streams";

export interface CatalogReportEmptyCopy {
  title: string;
  body: string;
  /** Omitted when there is nothing useful for the viewer to do. */
  cta?: { label: string; href?: string; action?: "login" };
}

export interface CatalogReportViewer {
  /** Whether the signed-in viewer has any catalog of their own. */
  hasOwnCatalogs: boolean;
}

export interface CatalogReportMeasuredScope {
  /** Tracks measured in scope, when the caller knows it. */
  measuredSongCount?: number;
}

const COPY: Record<CatalogReportEmptyState, CatalogReportEmptyCopy> = {
  "signed-out": {
    title: "Sign in to see this report",
    body: "Catalog measurements are tied to the account that ran them, so we need to know who you are before we can show this one.",
    cta: { label: "Sign in", action: "login" },
  },
  measuring: {
    title: MEASURING_TITLE,
    body: `${MEASURING_BODY} The report appears here on its own, so there is no need to run the valuation again.`,
  },
  "other-account": {
    title: "This catalog was measured by another account",
    body: "Its play counts and valuation belong to the account that measured it. Here is how to get this report for your own music.",
    cta: { label: "Go to your catalogs", href: "/catalogs" },
  },
  error: {
    title: "Couldn't load this report",
    body: "Something went wrong loading the measurements. Refresh to try again; your songs are still available in the Manage songs tab.",
  },
  no_streams: {
    title: "No streams found yet",
    // Measurements read the matched artist's releases, not connected socials,
    // so the honest next step is checking the match: a wrong Spotify match is
    // a real cause of a zero-stream verdict.
    body: "We measured this catalog and found no Spotify plays yet. If that looks wrong, check that we matched the right artist profiles. Your valuation will appear as plays start logging.",
    cta: { label: "Check your matched profiles", href: "/setup/socials" },
  },
};

/**
 * User-facing copy for every non-ready report state. Kept out of the component
 * so the wording itself is testable: the empty state must never send a
 * signed-in customer back to the marketing site (chat#1912 row 1).
 */
export function getCatalogReportEmptyCopy(
  state: CatalogReportEmptyState,
  viewer: CatalogReportViewer,
  scope: CatalogReportMeasuredScope = {},
): CatalogReportEmptyCopy {
  const copy = COPY[state];

  if (state === "no_streams" && scope.measuredSongCount) {
    return {
      ...copy,
      body: copy.body.replace(
        "We measured this catalog",
        `We measured ${scope.measuredSongCount} track${scope.measuredSongCount === 1 ? "" : "s"} in this catalog`,
      ),
    };
  }

  // A viewer who cannot see this catalog still needs somewhere to go, and
  // "your catalogs" is only somewhere for people who have one. A stranger
  // following a shared link usually has none, so point them at the step that
  // creates one instead of an empty page.
  if (state === "other-account" && !viewer.hasOwnCatalogs) {
    return {
      ...copy,
      cta: { label: "Value your catalog", href: "/setup/artists" },
    };
  }

  return copy;
}
