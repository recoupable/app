// @vitest-environment jsdom
import React from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import OAuthConnections from "../OAuthConnections";
const { auth, load, revoke } = vi.hoisted(() => ({
  auth: {
    ready: true,
    authenticated: true,
    user: { id: "alice", email: { address: "alice@example.test" } },
    login: vi.fn(),
    getAccessToken: vi.fn(async () => "token"),
  },
  load: vi.fn(),
  revoke: vi.fn(),
}));
vi.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));
vi.mock("@privy-io/react-auth", () => ({ usePrivy: () => auth }));
vi.mock("@/lib/oauth/createConnectionsClient", () => ({
  createConnectionsClient: () => ({ load, revoke }),
}));
beforeEach(() => {
  vi.clearAllMocks();
  auth.authenticated = true;
  auth.user.id = "alice";
  load.mockResolvedValue({
    connections: [
      {
        id: "a".repeat(64),
        clientName: "Test agent",
        clientId: "client",
        scopes: ["mcp:read", "mcp:write"],
        createdAt: 1,
        expiresAt: 2000000000,
      },
    ],
    truncated: false,
  });
  revoke.mockResolvedValue(undefined);
});
afterEach(cleanup);
it("shows connections and removes a successfully revoked grant", async () => {
  render(<OAuthConnections issuer="https://api.example/api/oauth" />);
  await screen.findByText("Test agent");
  fireEvent.click(
    screen.getByRole("button", { name: "Disconnect Test agent" }),
  );
  await waitFor(() =>
    expect(revoke).toHaveBeenCalledWith("token", "a".repeat(64)),
  );
  await screen.findByText("No connected agents.");
});
it("hides another account's connections immediately on identity change", async () => {
  const view = render(
    <OAuthConnections issuer="https://api.example/api/oauth" />,
  );
  await screen.findByText("Test agent");
  load.mockImplementation(() => new Promise(() => {}));
  auth.user.id = "bob";
  view.rerender(<OAuthConnections issuer="https://api.example/api/oauth" />);
  expect(screen.queryByText("Test agent")).toBeNull();
});
it("requires login and keeps a connection visible if revocation fails", async () => {
  auth.authenticated = false;
  const view = render(
    <OAuthConnections issuer="https://api.example/api/oauth" />,
  );
  expect(load).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Sign in to Recoup" }));
  expect(auth.login).toHaveBeenCalled();
  auth.authenticated = true;
  revoke.mockRejectedValue(new Error("Unable to revoke connection."));
  view.rerender(<OAuthConnections issuer="https://api.example/api/oauth" />);
  await screen.findByText("Test agent");
  fireEvent.click(
    screen.getByRole("button", { name: "Disconnect Test agent" }),
  );
  await screen.findByRole("alert");
  expect(screen.getByText("Test agent")).toBeDefined();
});

it("does not restore a revoked connection from an older refresh", async () => {
  render(<OAuthConnections issuer="https://api.example/api/oauth" />);
  await screen.findByText("Test agent");
  const stale = await load.mock.results[0].value;
  let finish!: (value: typeof stale) => void;
  load.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Refresh connections" }));
  await waitFor(() => expect(load).toHaveBeenCalledTimes(2));
  fireEvent.click(
    screen.getByRole("button", { name: "Disconnect Test agent" }),
  );
  await screen.findByText("No connected agents.");
  await act(async () => {
    finish(stale);
  });
  expect(screen.queryByText("Test agent")).toBeNull();
});

it("shows persistent connections without an expiration date", async () => {
  load.mockResolvedValue({
    connections: [
      {
        id: "a".repeat(64),
        clientName: "Persistent agent",
        clientId: "client",
        scopes: ["mcp:read"],
        createdAt: 1,
        expiresAt: null,
      },
    ],
    truncated: false,
  });
  render(<OAuthConnections issuer="https://api.example/api/oauth" />);
  await screen.findByText("Until you disconnect");
  expect(screen.queryByText(/Expires/)).toBeNull();
});
