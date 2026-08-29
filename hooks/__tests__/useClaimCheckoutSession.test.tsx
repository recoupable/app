// @vitest-environment jsdom
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useClaimCheckoutSession } from "@/hooks/useClaimCheckoutSession";
import { claimCheckoutSession } from "@/lib/subscriptions/claimCheckoutSession";

const replace = vi.fn();
const toastSuccess = vi.fn();
const toastError = vi.fn();
let search = "";
let authenticated = true;

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/tasks",
  useSearchParams: () => new URLSearchParams(search),
}));
vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));
vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({ authenticated, getAccessToken: async () => "token" }),
}));
vi.mock("@/lib/subscriptions/claimCheckoutSession", () => ({ claimCheckoutSession: vi.fn() }));

const wrapperFor = (client: QueryClient) =>
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };

describe("useClaimCheckoutSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
    search = "checkout=success&session_id=cs_1";
    authenticated = true;
  });

  it("claims once after a success redirect, thanks the customer, and strips the params", async () => {
    vi.mocked(claimCheckoutSession).mockResolvedValue({ status: "success", subscription_id: "sub_1", plan: "pro" });
    const client = new QueryClient();
    const invalidate = vi.spyOn(client, "invalidateQueries");
    const { rerender } = renderHook(() => useClaimCheckoutSession(), { wrapper: wrapperFor(client) });
    await waitFor(() => expect(toastSuccess).toHaveBeenCalledTimes(1));
    rerender();
    expect(claimCheckoutSession).toHaveBeenCalledTimes(1);
    expect(claimCheckoutSession).toHaveBeenCalledWith("token", "cs_1");
    expect(toastSuccess.mock.calls[0][0]).toMatch(/Pro/);
    expect(replace).toHaveBeenCalledWith("/tasks");
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["credits"], exact: false });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["proStatus"], exact: false });
  });

  it("does nothing without the redirect params or while signed out", async () => {
    search = "";
    renderHook(() => useClaimCheckoutSession(), { wrapper: wrapperFor(new QueryClient()) });
    search = "checkout=success&session_id=cs_1";
    authenticated = false;
    renderHook(() => useClaimCheckoutSession(), { wrapper: wrapperFor(new QueryClient()) });
    await new Promise((r) => setTimeout(r, 10));
    expect(claimCheckoutSession).not.toHaveBeenCalled();
  });

  it("words an already_claimed answer for the customer and still strips the params", async () => {
    vi.mocked(claimCheckoutSession).mockRejectedValue(new Error("already_claimed"));
    renderHook(() => useClaimCheckoutSession(), { wrapper: wrapperFor(new QueryClient()) });
    await waitFor(() => expect(toastError).toHaveBeenCalledTimes(1));
    expect(toastError.mock.calls[0][0]).toMatch(/another account/i);
    expect(replace).toHaveBeenCalledWith("/tasks");
  });

  it("never re-claims the same session in the tab, even after a reload", async () => {
    vi.mocked(claimCheckoutSession).mockResolvedValue({ status: "success", subscription_id: "sub_1", plan: "starter" });
    renderHook(() => useClaimCheckoutSession(), { wrapper: wrapperFor(new QueryClient()) });
    await waitFor(() => expect(toastSuccess).toHaveBeenCalledTimes(1));
    renderHook(() => useClaimCheckoutSession(), { wrapper: wrapperFor(new QueryClient()) });
    await new Promise((r) => setTimeout(r, 10));
    expect(claimCheckoutSession).toHaveBeenCalledTimes(1);
  });
});
