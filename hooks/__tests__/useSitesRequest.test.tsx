// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
const auth = vi.hoisted(() => ({ getAccessToken: vi.fn() }));
vi.mock("@privy-io/react-auth", () => ({ usePrivy: () => auth }));
import { useSitesRequest } from "../useSitesRequest";
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.resetAllMocks();
});
it("ends a stalled sign-in instead of leaving Building forever", async () => {
  vi.useFakeTimers();
  auth.getAccessToken.mockReturnValue(new Promise(() => {}));
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  const { result } = renderHook(() => useSitesRequest());
  const request = result.current("/api/sites");
  const assertion = expect(request).rejects.toThrow(
    "sign-in session is not responding",
  );
  await vi.advanceTimersByTimeAsync(20000);
  await assertion;
  expect(fetch).not.toHaveBeenCalled();
});
it("does not send an unauthenticated request", async () => {
  auth.getAccessToken.mockResolvedValue(null);
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  const { result } = renderHook(() => useSitesRequest());
  await expect(result.current("/api/sites")).rejects.toThrow("Please sign in");
  expect(fetch).not.toHaveBeenCalled();
});
