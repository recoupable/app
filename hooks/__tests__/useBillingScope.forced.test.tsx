// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import useBillingScope from "@/hooks/useBillingScope";

const ORG = "5d2be75b-b49b-4c2a-ac0a-63d812430dda";
const OTHER = "123e4567-e89b-12d3-a456-426614174000";

vi.mock("@/providers/UserProvder", () => ({
  useUserProvider: () => ({ userData: { account_id: "acct-1" } }),
}));
vi.mock("@/providers/OrganizationProvider", () => ({
  useOrganization: () => ({
    selectedOrgId: "org-1",
    setSelectedOrgId: vi.fn(),
  }),
}));
vi.mock("@/hooks/useAccountOrganizations", () => ({
  default: () => ({
    data: [
      { id: "m1", organization_id: "org-1", organization_name: "Rostrum" },
      { id: "m2", organization_id: ORG, organization_name: "Seeker Music" },
    ],
  }),
}));

describe("useBillingScope with a forced account id", () => {
  it("wins over the selected org and names the org when it is one of mine", () => {
    const { result } = renderHook(() => useBillingScope(ORG));
    expect(result.current.accountId).toBe(ORG);
    expect(result.current.isOrg).toBe(true);
    expect(result.current.scopeLabel).toBe("Seeker Music");
    expect(result.current.forced).toBe(true);
    expect(result.current.invalid).toBe(false);
  });

  it("labels an account that is not one of my orgs as this account", () => {
    const { result } = renderHook(() => useBillingScope(OTHER));
    expect(result.current.accountId).toBe(OTHER);
    expect(result.current.isOrg).toBe(false);
    expect(result.current.scopeLabel).toBe("this account");
  });

  it("flags a non-UUID id as invalid and resolves no account", () => {
    const { result } = renderHook(() => useBillingScope("not-a-uuid"));
    expect(result.current.invalid).toBe(true);
    expect(result.current.accountId).toBeUndefined();
  });
});
