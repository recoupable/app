import { useCallback } from "react";
import { useUserProvider } from "@/providers/UserProvder";
import { useOrganization } from "@/providers/OrganizationProvider";
import useAccountOrganizations from "@/hooks/useAccountOrganizations";

export interface BillingScope {
  /** The account the billing page reads and writes: the selected org, else the signed-in account. */
  accountId: string | undefined;
  isOrg: boolean;
  /** "your account" or the org's name, for the page subtitle. */
  scopeLabel: string;
  switchToPersonal: () => void;
}

/** Which account /billing is showing: the selected organization when it is one of mine, else me. */
const useBillingScope = (): BillingScope => {
  const { userData } = useUserProvider();
  const { selectedOrgId, setSelectedOrgId } = useOrganization();
  const { data: organizations } = useAccountOrganizations();
  const org = selectedOrgId
    ? organizations?.find((o) => o.organization_id === selectedOrgId)
    : undefined;
  const switchToPersonal = useCallback(
    () => setSelectedOrgId(null),
    [setSelectedOrgId],
  );
  if (org) {
    return {
      accountId: org.organization_id,
      isOrg: true,
      scopeLabel: org.organization_name || "your organization",
      switchToPersonal,
    };
  }
  return {
    accountId: userData?.account_id as string | undefined,
    isOrg: false,
    scopeLabel: "your account",
    switchToPersonal,
  };
};

export default useBillingScope;
