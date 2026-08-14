/**
 * What `/catalogs` says when it has nothing to show.
 *
 * An organization that owns no catalogs is the common case, not the exception:
 * 8 of the 9 organizations the founding account belongs to own none (measured
 * 2026-08-06). A bare "No catalogs found." there reads as though the account's
 * catalogs vanished, so an org view names the org it is empty *for*.
 *
 * @param selectedOrgId - Selected organization, or `null` for personal
 * @param orgName - That organization's name, absent until it loads
 */
export function getCatalogsEmptyCopy(
  selectedOrgId: string | null,
  orgName?: string,
): string {
  if (!selectedOrgId) return "No catalogs found.";

  return orgName
    ? `No catalogs in ${orgName} yet.`
    : "No catalogs in this organization yet.";
}
