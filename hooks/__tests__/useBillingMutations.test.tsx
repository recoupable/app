// @vitest-environment jsdom
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import useBillingMutations from "@/hooks/useBillingMutations";

vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({
    user: { id: "did:privy:alice" },
    getAccessToken: async () => "tok",
  }),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/lib/billing/updateClientAutoTopUp", () => ({
  default: vi.fn(async () => ({ enabled: true })),
}));
vi.mock("@/lib/billing/createClientPaymentMethodSession", () => ({
  default: vi.fn(async () => ({})),
}));

describe("useBillingMutations", () => {
  // Read keys are [key, viewer, account]; a save must not disturb other accounts' caches.
  it("invalidates only this viewer's read for this account after a save", async () => {
    const client = new QueryClient();
    client.setQueryData(["autoTopUp", "did:privy:alice", "acct-1"], {
      enabled: false,
    });
    client.setQueryData(["autoTopUp", "did:privy:alice", "acct-2"], {
      enabled: false,
    });
    client.setQueryData(["autoTopUp", "did:privy:bob", "acct-1"], {
      enabled: false,
    });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useBillingMutations("acct-1"), {
      wrapper,
    });

    await act(async () => {
      result.current.saveAutoTopUp.mutate({
        enabled: true,
        amountCents: 500,
        thresholdCents: 100,
      });
    });
    await waitFor(() =>
      expect(result.current.saveAutoTopUp.isSuccess).toBe(true),
    );

    const stale = (key: unknown[]) => client.getQueryState(key)?.isInvalidated;
    expect(stale(["autoTopUp", "did:privy:alice", "acct-1"])).toBe(true);
    expect(stale(["autoTopUp", "did:privy:alice", "acct-2"])).toBe(false);
    expect(stale(["autoTopUp", "did:privy:bob", "acct-1"])).toBe(false);
  });

  // Stripe checkout opens in the same tab: the helper calls location.assign and
  // resolves at once, so the mutation must stay pending until the page unloads,
  // or a slow navigation would re-enable the button and allow a second session.
  it("keeps configureCard pending after the session resolves, until the page unloads", async () => {
    const client = new QueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useBillingMutations("acct-1"), {
      wrapper,
    });
    expect(result.current.configureCard.isPending).toBe(false);
    act(() => result.current.configureCard.mutate());
    await waitFor(() =>
      expect(result.current.configureCard.isPending).toBe(true),
    );
  });
});
