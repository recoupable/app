// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import ContextFunnel from "../ContextFunnel";
const state = vi.hoisted(() => ({
  authenticated: false,
  busy: false,
  requestId: null as string | null,
  snapshot: null as null | { status: string },
}));
vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({ ready: true, authenticated: state.authenticated }),
}));
vi.mock("@/providers/UserProvder", () => ({
  useUserProvider: () => ({ userData: { account_id: "account" } }),
}));
vi.mock("@/hooks/useContextFunnel", () => ({
  useContextFunnel: () => ({ ...state, error: "", save: vi.fn() }),
}));
vi.mock("@/components/VercelChat/ChatComposer", () => ({
  default: () => <textarea aria-label="Spotify track URL" />,
}));
afterEach(() => {
  cleanup();
  state.authenticated = false;
  state.busy = false;
  state.requestId = null;
  state.snapshot = null;
});
it("does not ask visitors to save before metadata finishes", () => {
  state.busy = true;
  render(<ContextFunnel />);
  expect(screen.queryByRole("button", { name: /sign in|save/i })).toBeNull();
});
it("offers sign-in after the guest preview is ready", () => {
  state.snapshot = { status: "ready" };
  render(<ContextFunnel />);
  expect(screen.getByRole("button", { name: "Sign in and save" })).toBeTruthy();
});
it("does not tell a signed-in visitor to sign in", () => {
  state.authenticated = true;
  state.snapshot = { status: "ready" };
  render(<ContextFunnel />);
  expect(screen.queryByText(/Sign in to keep/)).toBeNull();
  expect(
    screen.getByRole("button", { name: "Save to my account" }),
  ).toBeTruthy();
});
it("does not report failed extraction as saved", () => {
  state.requestId = "request";
  state.snapshot = { status: "failed" };
  render(<ContextFunnel />);
  expect(screen.queryByText(/Saved to your personal account/)).toBeNull();
});
