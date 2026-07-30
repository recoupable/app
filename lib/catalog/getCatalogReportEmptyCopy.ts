import type { CatalogReportState } from "./getCatalogReportState";

export type CatalogReportEmptyState = Exclude<
  CatalogReportState,
  "loading" | "ready"
>;

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

const COPY: Record<CatalogReportEmptyState, CatalogReportEmptyCopy> = {
  "signed-out": {
    title: "Sign in to see this report",
    body: "Catalog measurements are tied to the account that ran them, so we need to know who you are before we can show this one.",
    cta: { label: "Sign in", action: "login" },
  },
  measuring: {
    title: "Measuring your catalog",
    body: "We are pulling live play counts for every track. This usually takes about a minute, and the report appears here on its own. There is no need to run the valuation again.",
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
};

/**
 * User-facing copy for every non-ready report state. Kept out of the component
 * so the wording itself is testable: the empty state must never send a
 * signed-in customer back to the marketing site (chat#1912 row 1).
 */
export function getCatalogReportEmptyCopy(
  state: CatalogReportEmptyState,
  viewer: CatalogReportViewer,
): CatalogReportEmptyCopy {
  const copy = COPY[state];

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
