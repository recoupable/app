// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useUpgradeNavigation } from "@/hooks/useUpgradeNavigation";
import { trackEvent } from "@/lib/analytics/trackEvent";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/lib/analytics/trackEvent", () => ({ trackEvent: vi.fn() }));
vi.mock("@/providers/UserProvder", () => ({
  useUserProvider: () => ({ userData: { account_id: "acc-1", email: "someone@example.com" } }),
}));

describe("useUpgradeNavigation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("tracks upgrade_clicked with the account id (never the email) and opens /plan", () => {
    const { result } = renderHook(() => useUpgradeNavigation());
    result.current.upgrade("credits_low");
    expect(trackEvent).toHaveBeenCalledWith("upgrade_clicked", { trigger: "credits_low", account_id: "acc-1" });
    expect(JSON.stringify(vi.mocked(trackEvent).mock.calls)).not.toContain("example.com");
    expect(push).toHaveBeenCalledWith("/plan");
  });
});
