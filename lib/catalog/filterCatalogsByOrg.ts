import type { Catalog } from "@/types/Catalog";

/**
 * Narrows `/catalogs` to the organization selected in the sidebar.
 *
 * Personal (`null`) keeps every catalog the account can see, its own and every
 * organization's, which is the union `GET /api/accounts/{id}/catalogs` returns
 * and the view an owner wants by default. Selecting an org narrows to that org
 * alone. Deliberately asymmetric, and deliberately unlike `/api/artists`, where
 * omitting `org_id` returns personal-only (chat#1943).
 *
 * `owner` is already resolved server-side to an owner the caller reads through,
 * preferring the organization when a catalog carries several links, so matching
 * on its id is the whole rule. A catalog the API could not attribute is left out
 * of an org view rather than guessed into it.
 *
 * Filtering happens here rather than in `useCatalogs` on purpose: that hook is
 * also the "does this account own a catalog" signal for onboarding, home
 * valuation and first-artist seeding, and an empty org would otherwise read as
 * an account with no catalogs.
 *
 * @param catalogs - Every catalog the account can see
 * @param selectedOrgId - Selected organization, or `null` for personal
 */
export function filterCatalogsByOrg(
  catalogs: Catalog[],
  selectedOrgId: string | null,
): Catalog[] {
  if (!selectedOrgId) return catalogs;

  return catalogs.filter((catalog) => catalog.owner?.id === selectedOrgId);
}
