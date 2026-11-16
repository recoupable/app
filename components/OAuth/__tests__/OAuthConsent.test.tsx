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
  auth.getAccessToken.mockResolvedValue("token");
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

it("shows the historical finite duration during rollout", async () => {
  load.mockResolvedValue({ ...details, accessDurationDays: 30 });
  render(
    <OAuthConsent issuer="https://api.example/api/oauth" interaction="id" />,
  );
  await screen.findByText(/Personal account · 30 days · Revoke anytime/);
});

it("discloses full tool access across accessible workspaces before approval", async () => {
  load.mockResolvedValue({
    ...details,
    permissions: [
      {
        scope: "mcp:tools",
        description:
          "Use all Recoup tools, including sending messages, publishing content and paid generation",
      },
    ],
  });
  render(
    <OAuthConsent issuer="https://api.example/api/oauth" interaction="full" />,
  );
  await screen.findByText(/Use all Recoup tools/);
  expect(
    screen.getByText(/Accessible workspaces · Until you disconnect/),
  ).toBeDefined();
  expect(
    screen.queryByText(/organization workspaces are not included/),
  ).toBeNull();
  expect(decide).not.toHaveBeenCalled();
});

it("shows organization access outside collapsed details", async () => {
  load.mockResolvedValue({
    ...details,
    permissions: [{ scope: "mcp:tools", description: "Full business tools" }],
  });
  render(
    <OAuthConsent issuer="https://api.example/api/oauth" interaction="full" />,
  );
  const disclosure = await screen.findByText(
    /Includes personal and organization workspaces/,
  );
  expect(disclosure.closest("details")).toBeNull();
});

it.each(["account", "interaction", "issuer", "sign-out"])(
  "does not submit a decision after %s changes while awaiting its token",
  async (change) => {
    const issuer = "https://api.example/api/oauth";
    const view = render(<OAuthConsent issuer={issuer} interaction="first" />);
    await screen.findByRole("button", { name: "Allow access" });
    let finishToken!: (value: string) => void;
    auth.getAccessToken.mockImplementationOnce(
      () =>
        new Promise<string>((resolve) => {
          finishToken = resolve;
        }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Allow access" }));
    if (change === "account") auth.user.id = "bob";
    if (change === "sign-out") auth.authenticated = false;
    view.rerender(
      <OAuthConsent
        issuer={
          change === "issuer" ? "https://other.example/api/oauth" : issuer
        }
        interaction={change === "interaction" ? "second" : "first"}
      />,
    );
    await act(async () => {
      finishToken("late-token");
    });
    expect(decide).not.toHaveBeenCalled();
  },
);

it("keeps the next interaction usable while the old decision is pending or fails", async () => {
  const issuer = "https://api.example/api/oauth";
  const view = render(<OAuthConsent issuer={issuer} interaction="first" />);
  await screen.findByRole("button", { name: "Allow access" });
  let failDecision!: (error: Error) => void;
  decide.mockImplementationOnce(
    () =>
      new Promise((_, reject) => {
        failDecision = reject;
      }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Allow access" }));
  await waitFor(() => expect(decide).toHaveBeenCalledTimes(1));
  load.mockResolvedValue({
    ...details,
    clientName: "Next agent",
    csrf: "next-nonce",
  });
  view.rerender(<OAuthConsent issuer={issuer} interaction="second" />);
  await screen.findByText("Next agent");
  expect(
    (screen.getByRole("button", { name: "Allow access" }) as HTMLButtonElement)
      .disabled,
  ).toBe(false);
  await act(async () => {
    failDecision(new Error("Old decision failed"));
  });
  expect(screen.queryByRole("alert")).toBeNull();
  expect(screen.getByRole("button", { name: "Allow access" })).toBeDefined();
});

it("does not redirect for a decision belonging to the previous interaction", async () => {
  const issuer = "https://api.example/api/oauth";
  const view = render(<OAuthConsent issuer={issuer} interaction="first" />);
  await screen.findByRole("button", { name: "Allow access" });
  let finishDecision!: (url: string) => void;
  decide.mockImplementationOnce(
    () =>
      new Promise<string>((resolve) => {
        finishDecision = resolve;
      }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Allow access" }));
  await waitFor(() => expect(decide).toHaveBeenCalledTimes(1));
  view.rerender(<OAuthConsent issuer={issuer} interaction="second" />);
  const originalUrl = window.location.href;
  try {
    await act(async () => {
      finishDecision("#stale-consent-response");
    });
    expect(window.location.href).toBe(originalUrl);
  } finally {
    window.history.replaceState(null, "", originalUrl);
  }
});
