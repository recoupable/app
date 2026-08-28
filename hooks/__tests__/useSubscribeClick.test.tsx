// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import useSubscribeClick from "@/hooks/useSubscribeClick";

const login = vi.fn();
const getAccessToken = vi.fn();
const createClientCheckoutSession = vi.fn();
const createClientPortalSession = vi.fn();
const toastError = vi.fn();

let userData: { account_id: string } | null = null;
let isSubscribed = false;

vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({ login, getAccessToken }),
}));

vi.mock("@/providers/UserProvder", () => ({
  useUserProvider: () => ({ userData }),
}));

vi.mock("@/providers/PaymentProvider", () => ({
  usePaymentProvider: () => ({ isSubscribed }),
}));

vi.mock("@/lib/stripe/createClientCheckoutSession", () => ({
  default: (...args: unknown[]) => createClientCheckoutSession(...args),
}));

vi.mock("@/lib/stripe/createClientPortalSession", () => ({
  default: (...args: unknown[]) => createClientPortalSession(...args),
}));

vi.mock("sonner", () => ({
  toast: { error: (...args: unknown[]) => toastError(...args) },
}));

describe("useSubscribeClick", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    userData = { account_id: "account-1" };
    isSubscribed = false;
    getAccessToken.mockResolvedValue("token-1");
    createClientCheckoutSession.mockResolvedValue(undefined);
    createClientPortalSession.mockResolvedValue(undefined);
  });

  it("opens the Privy login modal when signed out instead of no-oping", async () => {
    userData = null;
    const { result } = renderHook(() => useSubscribeClick());

    await act(async () => {
      await result.current.handleClick();
    });

    expect(login).toHaveBeenCalled();
    expect(createClientCheckoutSession).not.toHaveBeenCalled();
    expect(createClientPortalSession).not.toHaveBeenCalled();
  });

  it("opens the Privy login modal when no access token is available", async () => {
    getAccessToken.mockResolvedValue(null);
    const { result } = renderHook(() => useSubscribeClick());

    await act(async () => {
      await result.current.handleClick();
    });

    expect(login).toHaveBeenCalled();
    expect(createClientCheckoutSession).not.toHaveBeenCalled();
  });

  it("starts a checkout session for signed-in unsubscribed users", async () => {
    const { result } = renderHook(() => useSubscribeClick());

    await act(async () => {
      await result.current.handleClick();
    });

    expect(createClientCheckoutSession).toHaveBeenCalledWith("token-1");
    expect(createClientPortalSession).not.toHaveBeenCalled();
    expect(login).not.toHaveBeenCalled();
    expect(toastError).not.toHaveBeenCalled();
  });

  it("opens the billing portal for subscribed users", async () => {
    isSubscribed = true;
    const { result } = renderHook(() => useSubscribeClick());

    await act(async () => {
      await result.current.handleClick();
    });

    expect(createClientPortalSession).toHaveBeenCalledWith("token-1");
    expect(createClientCheckoutSession).not.toHaveBeenCalled();
  });

  it("surfaces checkout failures as a toast", async () => {
    createClientCheckoutSession.mockResolvedValue({
      error: new Error("HTTP 500"),
    });
    const { result } = renderHook(() => useSubscribeClick());

    await act(async () => {
      await result.current.handleClick();
    });

    expect(toastError).toHaveBeenCalledWith(
      "Could not start checkout. Please try again.",
    );
  });

  it("surfaces portal failures as a toast", async () => {
    isSubscribed = true;
    createClientPortalSession.mockResolvedValue({
      error: new Error("HTTP 500"),
    });
    const { result } = renderHook(() => useSubscribeClick());

    await act(async () => {
      await result.current.handleClick();
    });

    expect(toastError).toHaveBeenCalledWith(
      "Could not open billing. Please try again.",
    );
  });
});
