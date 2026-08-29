// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useUpgradeCheckout } from "@/hooks/useUpgradeCheckout";
import createClientCheckoutSession from "@/lib/stripe/createClientCheckoutSession";

const toastError = vi.fn();
let getAccessToken: () => Promise<string | null>;

vi.mock("sonner", () => ({ toast: { error: (...args: unknown[]) => toastError(...args) } }));
vi.mock("@privy-io/react-auth", () => ({ usePrivy: () => ({ getAccessToken: () => getAccessToken() }) }));
vi.mock("@/lib/stripe/createClientCheckoutSession", () => ({ default: vi.fn() }));

describe("useUpgradeCheckout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAccessToken = async () => "token";
  });

  it("opens checkout for the chosen plan with the bearer", async () => {
    vi.mocked(createClientCheckoutSession).mockResolvedValue(undefined);
    const { result } = renderHook(() => useUpgradeCheckout());
    await act(() => result.current.startCheckout("starter"));
    expect(createClientCheckoutSession).toHaveBeenCalledWith("token", { plan: "starter" });
    expect(toastError).not.toHaveBeenCalled();
  });

  it("toasts when the token refresh rejects instead of leaving an unhandled rejection", async () => {
    getAccessToken = async () => {
      throw new Error("refresh failed");
    };
    const { result } = renderHook(() => useUpgradeCheckout());
    await act(() => result.current.startCheckout("pro"));
    expect(toastError).toHaveBeenCalledTimes(1);
    expect(createClientCheckoutSession).not.toHaveBeenCalled();
  });

  it("toasts when the api rejects the session", async () => {
    vi.mocked(createClientCheckoutSession).mockResolvedValue({ error: new Error("HTTP 400") });
    const { result } = renderHook(() => useUpgradeCheckout());
    await act(() => result.current.startCheckout("pro"));
    expect(toastError).toHaveBeenCalledWith("Could not open checkout. Please try again.");
  });
});
