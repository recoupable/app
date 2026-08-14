import type { AccountOrganization } from "@/hooks/useAccountOrganizations";

/**
 * The organization `/catalogs` should actually scope to, given the sidebar
 * selection and the account's real memberships.
 *
 * `selectedOrgId` is persisted, so it outlives the account that chose it: sign
 * in as someone else, or lose membership, and the stored id names an
 * organization this account is not in. Filtering on it would empty the page and
 * — worse — the empty state would name an organization the viewer cannot see.
 * An unrecognised selection is therefore treated as personal, which shows the
 * union rather than nothing.
 *
 * The membership list being absent means "still loading", not "no memberships":
 * the selection is kept so switching orgs doesn't flash the whole union on
 * every mount.
 *
 * @param selectedOrgId - Selected organization, or `null` for personal
 * @param organizations - The account's organizations, `undefined` while loading
 * @returns The organization to scope to, or `null` for personal
 */
export function resolveSelectedOrgId(
  selectedOrgId: string | null,
  organizations: AccountOrganization[] | undefined,
): string | null {
  if (!selectedOrgId) return null;
  if (!organizations) return selectedOrgId;

  const isMember = organizations.some(
    (organization) => organization.organization_id === selectedOrgId,
  );
  return isMember ? selectedOrgId : null;
}
