// @vitest-environment jsdom
import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import useBillingScope from "@/hooks/useBillingScope";

const setSelectedOrgId = vi.fn();
let selectedOrgId: string | null = null;

vi.mock("@/providers/UserProvder", () => ({
  useUserProvider: () => ({ userData: { account_id: "acct-1" } }),
}));
vi.mock("@/providers/OrganizationProvider", () => ({
  useOrganization: () => ({ selectedOrgId, setSelectedOrgId }),
}));
vi.mock("@/hooks/useAccountOrganizations", () => ({
  default: () => ({
    data: [
      { id: "m1", organization_id: "org-1", organization_name: "Seeker Music" },
    ],
  }),
}));

describe("useBillingScope", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    selectedOrgId = null;
  });

  it("scopes to the personal account when no org is selected", () => {
    const { result } = renderHook(() => useBillingScope());
    expect(result.current.accountId).toBe("acct-1");
    expect(result.current.isOrg).toBe(false);
    expect(result.current.scopeLabel).toBe("your account");
  });

  it("scopes to the selected org and names it", () => {
    selectedOrgId = "org-1";
    const { result } = renderHook(() => useBillingScope());
    expect(result.current.accountId).toBe("org-1");
    expect(result.current.isOrg).toBe(true);
    expect(result.current.scopeLabel).toBe("Seeker Music");
  });

  it("falls back to the personal account when the selected org is not one of mine", () => {
    selectedOrgId = "org-unknown";
    const { result } = renderHook(() => useBillingScope());
    expect(result.current.accountId).toBe("acct-1");
    expect(result.current.isOrg).toBe(false);
  });

  it("switchToPersonal clears the selected org", () => {
    selectedOrgId = "org-1";
    const { result } = renderHook(() => useBillingScope());
    act(() => result.current.switchToPersonal());
    expect(setSelectedOrgId).toHaveBeenCalledWith(null);
  });
});
