import { useCallback } from "react";
import { useUserProvider } from "@/providers/UserProvder";
import { useOrganization } from "@/providers/OrganizationProvider";
import useAccountOrganizations from "@/hooks/useAccountOrganizations";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface BillingScope {
  /** The account the billing page reads and writes. */
  accountId: string | undefined;
  isOrg: boolean;
  /** "your account", the org's name, or "this account" for a forced id outside my orgs. */
  scopeLabel: string;
  /** True when the id came from the route (/billing/{accountId}); the org selector is ignored. */
  forced: boolean;
  /** True when a forced id is not a UUID; nothing is read. */
  invalid: boolean;
  switchToPersonal: () => void;
}

/**
 * Which account /billing shows. Precedence: the route's account id, else the
 * selected organization when it is one of mine, else me. The api decides
 * access; a forced id the caller may not read surfaces as a 403 on the reads.
 */
const useBillingScope = (forcedAccountId?: string): BillingScope => {
  const { userData } = useUserProvider();
  const { selectedOrgId, setSelectedOrgId } = useOrganization();
  const { data: organizations } = useAccountOrganizations();
  const switchToPersonal = useCallback(
    () => setSelectedOrgId(null),
    [setSelectedOrgId],
  );
  const me = userData?.account_id as string | undefined;
  const findOrg = (id: string | null | undefined) =>
    id ? organizations?.find((o) => o.organization_id === id) : undefined;

  if (forcedAccountId !== undefined) {
    const invalid = !UUID.test(forcedAccountId);
    const org = invalid ? undefined : findOrg(forcedAccountId);
    return {
      accountId: invalid ? undefined : forcedAccountId,
      isOrg: !!org,
      scopeLabel: org
        ? org.organization_name || "your organization"
        : forcedAccountId === me
          ? "your account"
          : "this account",
      forced: true,
      invalid,
      switchToPersonal,
    };
  }
  const org = findOrg(selectedOrgId);
  return org
    ? {
        accountId: org.organization_id,
        isOrg: true,
        scopeLabel: org.organization_name || "your organization",
        forced: false,
        invalid: false,
        switchToPersonal,
      }
    : {
        accountId: me,
        isOrg: false,
        scopeLabel: "your account",
        forced: false,
        invalid: false,
        switchToPersonal,
      };
};

export default useBillingScope;
