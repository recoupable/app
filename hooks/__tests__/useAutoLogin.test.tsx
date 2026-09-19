// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({
  ready: false,
  authenticated: false,
  email: "",
  pathname: "/sites",
  login: vi.fn(),
}));
vi.mock("@privy-io/react-auth", () => ({ usePrivy: () => state }));
vi.mock("next/navigation", () => ({ usePathname: () => state.pathname }));
vi.mock("@/providers/UserProvder", () => ({
  useUserProvider: () => ({ email: state.email }),
}));
vi.mock("@/providers/MiniAppProvider", () => ({
  useMiniAppContext: () => ({ isMiniApp: false, isLoading: false }),
}));
import { useAutoLogin } from "../useAutoLogin";
beforeEach(() => {
  Object.assign(state, {
    ready: false,
    authenticated: false,
    email: "",
    pathname: "/sites",
  });
  state.login.mockClear();
});
it("waits for authentication before prompting, then prompts only once", () => {
  const { rerender } = renderHook(() => useAutoLogin());
  expect(state.login).not.toHaveBeenCalled();
  state.ready = true;
  rerender();
  rerender();
  expect(state.login).toHaveBeenCalledTimes(1);
});
it("does not prompt a signed-in user while their account loads", () => {
  state.ready = true;
  state.authenticated = true;
  renderHook(() => useAutoLogin());
  expect(state.login).not.toHaveBeenCalled();
});
it("preserves public artist pages", () => {
  state.ready = true;
  state.pathname = "/artists/11111111-1111-4111-8111-111111111111";
  renderHook(() => useAutoLogin());
  expect(state.login).not.toHaveBeenCalled();
});
