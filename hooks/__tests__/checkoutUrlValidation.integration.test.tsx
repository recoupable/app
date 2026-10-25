// @vitest-environment jsdom
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import useBillingMutations from "@/hooks/useBillingMutations";
import { useUpgradeCheckout } from "@/hooks/useUpgradeCheckout";
import { API_OVERRIDE_STORAGE_KEY } from "@/lib/consts";

const fetchMock = vi.fn();
const openMock = vi.fn();
const toastError = vi.fn();
const getAccessToken = vi.fn();
const login = vi.fn();
const initialUrl = window.location.href;

vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({
    user: { id: "did:privy:checkout-test" },
    getAccessToken,
    login,
  }),
}));
vi.mock("sonner", () => ({
  toast: {
    error: (...args: unknown[]) => toastError(...args),
    success: vi.fn(),
  },
}));

const callers = [
  {
    name: "useUpgradeCheckout",
    useStartCheckout: () => {
      const { startCheckout } = useUpgradeCheckout();
      return () => startCheckout("starter");
    },
    expectedBody: { plan: "starter" },
    errorMessage: "Could not open checkout. Please try again.",
  },
  {
    name: "useBillingMutations upgrade",
    useStartCheckout: () => useBillingMutations("acct-1").upgrade,
    expectedBody: {},
    errorMessage: "Could not open checkout: Checkout URL missing",
  },
];

describe.each(callers)(
  "$name with the checkout helper",
  ({ useStartCheckout, expectedBody, errorMessage }) => {
    beforeEach(() => {
      vi.clearAllMocks();
      fetchMock.mockReset();
      getAccessToken.mockResolvedValue("checkout-token");
      vi.stubGlobal("fetch", fetchMock);
      vi.stubGlobal("open", openMock);
      window.history.replaceState(null, "", "/billing?checkout=return#plans");
      window.sessionStorage.setItem(
        API_OVERRIDE_STORAGE_KEY,
        "https://recoup.invalid",
      );
    });

    afterEach(() => {
      window.history.replaceState(null, "", initialUrl);
      window.sessionStorage.clear();
      vi.unstubAllGlobals();
    });

    const renderCheckout = () => {
      const client = new QueryClient();
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      );
      return renderHook(useStartCheckout, { wrapper });
    };

    const expectCheckoutRequest = () => {
      expect(getAccessToken).toHaveBeenCalledTimes(1);
      expect(login).not.toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
        "https://recoup.invalid/api/subscriptions/sessions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer checkout-token",
          },
          body: JSON.stringify({
            successUrl: window.location.href,
            ...expectedBody,
          }),
        },
      );
    };

    it.each([
      ["number", 42],
      ["boolean", true],
      ["array", ["https://recoup.invalid/checkout"]],
      ["object", { url: "https://recoup.invalid/checkout" }],
    ])(
      "shows error feedback and does not open a %s checkout URL",
      async (_, url) => {
        fetchMock.mockResolvedValueOnce(
          new Response(JSON.stringify({ url }), { status: 200 }),
        );
        const { result } = renderCheckout();

        await act(() => result.current());

        expectCheckoutRequest();
        expect(openMock).not.toHaveBeenCalled();
        expect(toastError).toHaveBeenCalledExactlyOnceWith(errorMessage);
      },
    );

    it("opens a valid checkout URL without error feedback", async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({ url: "https://recoup.invalid/checkout" }),
          { status: 200 },
        ),
      );
      const { result } = renderCheckout();

      await act(() => result.current());

      expectCheckoutRequest();
      expect(openMock).toHaveBeenCalledExactlyOnceWith(
        "https://recoup.invalid/checkout",
        "_blank",
        "noopener,noreferrer",
      );
      expect(toastError).not.toHaveBeenCalled();
    });
  },
);
