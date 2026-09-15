// @vitest-environment jsdom
import React from "react";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useProvisionChatSession } from "@/hooks/sessions/useProvisionChatSession";

const provision = vi.hoisted(() => vi.fn());
vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({ getAccessToken: async () => "token" }),
}));
vi.mock("@/lib/sessions/provisionChatSession", () => ({
  provisionChatSession: provision,
}));
afterEach(() => {
  cleanup();
  provision.mockReset();
});
describe("session context transitions", () => {
  it("retries a failed workspace without changing its selected context", async () => {
    provision
      .mockRejectedValueOnce(new Error("Connection failed"))
      .mockResolvedValueOnce({ sessionId: "recovered", chatId: "chat" });
    const client = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(
      () =>
        useProvisionChatSession({
          enabled: true,
          artistId: undefined,
          orgId: "org",
        }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.status).toBe("error"));
    act(() => {
      if (result.current.status === "error") result.current.retry?.();
    });
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(provision).toHaveBeenCalledTimes(2);
    expect(provision.mock.calls[1][0]).toEqual({
      artistId: undefined,
      orgId: "org",
    });
  });

  it("never exposes the old session after an artist or workspace switch", async () => {
    provision.mockImplementation(async (input) => ({
      sessionId: `${input.orgId}-${input.artistId}`,
      chatId: "chat",
    }));
    const client = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const seen: unknown[] = [];
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { result, rerender } = renderHook(
      (props) => {
        const state = useProvisionChatSession(props);
        seen.push({ ...props, state });
        return state;
      },
      {
        wrapper,
        initialProps: {
          enabled: true,
          artistId: "a" as string | undefined,
          orgId: "org" as string | undefined,
        },
      },
    );
    await waitFor(() => expect(result.current.status).toBe("ready"));
    seen.length = 0;
    rerender({ enabled: true, artistId: undefined, orgId: "next" });
    await waitFor(() =>
      expect(result.current).toMatchObject({
        status: "ready",
        sessionId: "next-undefined",
      }),
    );
    expect(seen).not.toContainEqual(
      expect.objectContaining({
        state: expect.objectContaining({ sessionId: "org-a" }),
      }),
    );
    act(() => rerender({ enabled: false, artistId: undefined, orgId: "next" }));
    expect(result.current).toEqual({ status: "bootstrapping" });
  });
});
