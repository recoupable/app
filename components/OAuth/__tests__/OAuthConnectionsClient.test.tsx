// @vitest-environment jsdom
import React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import OAuthConnections from "../OAuthConnections";

const { auth } = vi.hoisted(() => ({
  auth: {
    ready: true,
    authenticated: true,
    user: { id: "synthetic-alice", email: { address: "alice@example.test" } },
    login: vi.fn(),
    getAccessToken: vi.fn(async () => "synthetic-first-party-login"),
  },
}));
vi.mock("@privy-io/react-auth", () => ({ usePrivy: () => auth }));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("preserves both grants on denial and revokes only the selected grant through the real client", async () => {
  const issuer = "https://api.example/api/oauth";
  const first = {
    id: "a".repeat(64),
    clientId: "fixture-one",
    clientName: "Fixture One",
    scopes: ["mcp:read", "mcp:write"],
    createdAt: 1,
    expiresAt: null,
  };
  const second = {
    ...first,
    id: "b".repeat(64),
    clientId: "fixture-two",
    clientName: "Fixture Two",
    scopes: ["mcp:tools"],
  };
  let connections = [first, second];
  let deny = true;
  const fetcher = vi.fn(async (url: string, init: RequestInit) => {
    expect(init.headers).toEqual({
      Authorization: "Bearer synthetic-first-party-login",
    });
    expect(init.credentials).toBe("omit");
    expect(init.redirect).toBe("error");
    expect(init.cache).toBe("no-store");
    if (init.method === "GET") {
      expect(url).toBe(`${issuer}/connections`);
      return Response.json({ connections, truncated: false });
    }
    expect(init.method).toBe("DELETE");
    expect(url).toBe(`${issuer}/connections/${first.id}`);
    if (deny)
      return Response.json(
        { error: "connection_unavailable" },
        { status: 404 },
      );
    connections = connections.filter((item) => item.id !== first.id);
    return new Response(null, { status: 204 });
  });
  vi.stubGlobal("fetch", fetcher);
  render(<OAuthConnections issuer={issuer} />);
  await screen.findByText("Fixture One");
  expect(screen.getByText("Fixture Two")).toBeDefined();
  fireEvent.click(
    screen.getByRole("button", { name: "Disconnect Fixture One" }),
  );
  expect((await screen.findByRole("alert")).textContent).toBe(
    "Unable to revoke connection. Try again.",
  );
  expect(screen.getByText("Fixture One")).toBeDefined();
  expect(screen.getByText("Fixture Two")).toBeDefined();
  expect(connections).toEqual([first, second]);
  deny = false;
  fireEvent.click(
    screen.getByRole("button", { name: "Disconnect Fixture One" }),
  );
  await waitFor(() => expect(screen.queryByText("Fixture One")).toBeNull());
  expect(screen.queryByRole("alert")).toBeNull();
  expect(screen.getByText("Fixture Two")).toBeDefined();
  expect(connections).toEqual([second]);
  fireEvent.click(screen.getByRole("button", { name: "Refresh connections" }));
  await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(4));
  expect(screen.getByText("Fixture Two")).toBeDefined();
  expect(screen.queryByText("Fixture One")).toBeNull();
});

it("shows connection instructions when empty and displays a new grant only after readback", async () => {
  const connection = {
    id: "c".repeat(64),
    clientId: "new-grant",
    clientName: "Reconnected fixture",
    scopes: ["mcp:read"],
    createdAt: 2,
    expiresAt: null,
  };
  const fetcher = vi
    .fn()
    .mockResolvedValue(Response.json({ connections: [], truncated: false }));
  vi.stubGlobal("fetch", fetcher);
  render(<OAuthConnections issuer="https://api.example/api/oauth" />);
  await screen.findByText("No connected agents.");
  expect(
    screen.getByText(/Connect Recoup from your agent’s settings/),
  ).toBeDefined();
  expect(screen.queryByText("Reconnected fixture")).toBeNull();
  expect(fetcher).toHaveBeenCalledTimes(1);
  fetcher.mockResolvedValue(
    Response.json({ connections: [connection], truncated: false }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Refresh connections" }));
  await screen.findByText("Reconnected fixture");
  expect(screen.queryByText("No connected agents.")).toBeNull();
  expect(screen.getByText("Until you disconnect")).toBeDefined();
  expect(fetcher).toHaveBeenCalledTimes(2);
  expect(fetcher.mock.calls.every(([, init]) => init.method === "GET")).toBe(
    true,
  );
});
