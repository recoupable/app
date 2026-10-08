// @vitest-environment jsdom
import React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import OAuthConsent from "../OAuthConsent";

const { auth, load, decide } = vi.hoisted(() => ({
  auth: {
    ready: true,
    authenticated: true,
    user: { id: "alice", email: { address: "alice@example.test" } },
    login: vi.fn(),
    logout: vi.fn(),
    getAccessToken: vi.fn(async () => "token"),
  },
  load: vi.fn(),
  decide: vi.fn(),
}));
vi.mock("@privy-io/react-auth", () => ({ usePrivy: () => auth }));
vi.mock("@/lib/oauth/createConsentClient", () => ({
  createConsentClient: () => ({ load, decide }),
}));
const details = {
  csrf: "nonce",
  clientName: "Test agent",
  clientId: "agent-id",
  accessDurationDays: null,
  permissions: [
    { scope: "mcp:read", description: "Read account data" },
    { scope: "mcp:write", description: "Create and edit artist profiles" },
  ],
};
beforeEach(() => {
  vi.clearAllMocks();
  auth.authenticated = true;
  auth.user.id = "alice";
  load.mockResolvedValue(details);
  decide.mockRejectedValue(new Error("Restart connection"));
});
afterEach(cleanup);
it("hides old app permissions immediately when the interaction changes", async () => {
  const view = render(
    <OAuthConsent issuer="https://api.example/api/oauth" interaction="first" />,
  );
  await screen.findByText("Create and edit artist profiles");
  load.mockImplementation(() => new Promise(() => {}));
  view.rerender(
    <OAuthConsent
      issuer="https://api.example/api/oauth"
      interaction="second"
    />,
  );
  expect(screen.queryByText("Create and edit artist profiles")).toBeNull();
  expect(screen.queryByRole("button", { name: "Allow access" })).toBeNull();
  expect(decide).not.toHaveBeenCalled();
});
it("does not load or approve permissions before sign-in", () => {
  auth.authenticated = false;
  render(
    <OAuthConsent issuer="https://api.example/api/oauth" interaction="id" />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Sign in to Recoup" }));
  expect(auth.login).toHaveBeenCalledOnce();
  expect(load).not.toHaveBeenCalled();
  expect(decide).not.toHaveBeenCalled();
});
it("shows write permissions and persistent personal access before an explicit approval", async () => {
  render(
    <OAuthConsent issuer="https://api.example/api/oauth" interaction="id" />,
  );
  await screen.findByText("Create and edit artist profiles");
  expect(
    screen.getByText(/Personal account · Until you disconnect/),
  ).toBeDefined();
  expect(
    screen.getByText(/organization workspaces are not included/),
  ).toBeDefined();
  expect(decide).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Allow access" }));
  await waitFor(() =>
    expect(decide).toHaveBeenCalledExactlyOnceWith("token", "nonce", "approve"),
  );
  await screen.findByRole("alert");
  expect(screen.queryByRole("button", { name: "Allow access" })).toBeNull();
});
it("sends denial when canceled and never reuses another account's loaded consent", async () => {
  const rendered = render(
    <OAuthConsent issuer="https://api.example/api/oauth" interaction="id" />,
  );
  await screen.findByText("Create and edit artist profiles");
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  await waitFor(() =>
    expect(decide).toHaveBeenCalledExactlyOnceWith("token", "nonce", "deny"),
  );
  auth.user.id = "bob";
  load.mockImplementation(() => new Promise(() => {}));
  rendered.rerender(
    <OAuthConsent issuer="https://api.example/api/oauth" interaction="id" />,
  );
  expect(screen.queryByRole("button", { name: "Allow access" })).toBeNull();
});
