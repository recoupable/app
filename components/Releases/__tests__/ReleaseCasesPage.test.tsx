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
import { afterEach, expect, it, vi } from "vitest";
import ReleaseCasesPage from "../ReleaseCasesPage";
const state = vi.hoisted(() => ({
  org: "org-a",
  authenticated: true,
  token: "token" as string | null,
}));
vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({
    authenticated: state.authenticated,
    ready: true,
    getAccessToken: async () => state.token,
    login: vi.fn(),
  }),
}));
vi.mock("@/providers/UserProvder", () => ({
  useUserProvider: () => ({ userData: { account_id: "actor" } }),
}));
vi.mock("@/providers/OrganizationProvider", () => ({
  useOrganization: () => ({ selectedOrgId: state.org, isInitialized: true }),
}));
const item = {
  request_id: "request",
  url: "https://open.spotify.com/album/example",
  created_at: "2026-10-08T15:00:00Z",
  status: "partial",
};
const projection = {
  request_id: "request",
  title: "Fixture release",
  fingerprint: "a".repeat(64),
  readiness: "partial",
  reviewable: true,
  tracks: [],
  gaps: ["Missing composition"],
  evidence_manifest: [],
  identity_observations: { candidates: [] },
  track_page: { hasMore: false },
  latest_review: null,
};
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  state.org = "org-a";
  state.authenticated = true;
  state.token = "token";
});
it("reviews the exact observed fingerprint and does not authorize distribution", async () => {
  const bodies: Record<string, unknown>[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url, init) => {
      const body = JSON.parse(init.body);
      bodies.push(body);
      return Response.json(
        body.action === "list_release_cases"
          ? { cases: [item], has_more: false }
          : body.action === "review_release_case"
            ? { id: "review", state: "saved" }
            : projection,
      );
    }),
  );
  render(<ReleaseCasesPage />);
  fireEvent.click(
    await screen.findByRole("button", { name: /Open saved release/ }),
  );
  expect(await screen.findByText("Fixture release")).toBeTruthy();
  expect(screen.getByText("Missing composition")).toBeTruthy();
  fireEvent.click(
    screen.getByRole("button", { name: "Mark metadata reviewed" }),
  );
  await waitFor(() =>
    expect(
      bodies.find((x) => x.action === "review_release_case"),
    ).toMatchObject({
      fingerprint: "a".repeat(64),
      organization_id: "org-a",
      decision: "reviewed",
    }),
  );
  expect(
    screen.queryByRole("button", { name: /distribute|register rights/i }),
  ).toBeNull();
});
it("immediately hides private case content on workspace switch", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url, init) =>
      Response.json(
        JSON.parse(init.body).action === "list_release_cases"
          ? { cases: [item], has_more: false }
          : projection,
      ),
    ),
  );
  const { rerender } = render(<ReleaseCasesPage />);
  fireEvent.click(
    await screen.findByRole("button", { name: /Open saved release/ }),
  );
  await screen.findByText("Fixture release");
  state.org = "org-b";
  await act(async () => {
    rerender(<ReleaseCasesPage />);
  });
  expect(screen.queryByText("Fixture release")).toBeNull();
});
it("shows a failed read as an error rather than an empty release", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => Response.json({ error: "Unavailable" }, { status: 409 })),
  );
  render(<ReleaseCasesPage />);
  expect(await screen.findByRole("alert")).toBeTruthy();
  expect(screen.queryByText("No saved releases yet.")).toBeNull();
});
it("does not load private data when signed out", async () => {
  state.authenticated = false;
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  await act(async () => {
    render(<ReleaseCasesPage />);
  });
  expect(screen.getByRole("button", { name: "Sign in" })).toBeTruthy();
  expect(fetcher).not.toHaveBeenCalled();
});

it("ignores an old workspace response arriving after a switch", async () => {
  let finishOldRead!: (response: Response) => void;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url, init) => {
      const body = JSON.parse(init.body);
      if (body.action === "read_release_case")
        return new Promise<Response>((resolve) => {
          finishOldRead = resolve;
        });
      return Response.json({
        cases: body.organization_id === "org-a" ? [item] : [],
        has_more: false,
      });
    }),
  );
  const { rerender } = render(<ReleaseCasesPage />);
  fireEvent.click(
    await screen.findByRole("button", { name: /Open saved release/ }),
  );
  await waitFor(() => expect(finishOldRead).toBeDefined());
  state.org = "org-b";
  await act(async () => {
    rerender(<ReleaseCasesPage />);
  });
  await screen.findByText("No saved releases yet.");
  await act(async () => {
    finishOldRead(Response.json(projection));
  });
  await waitFor(() => expect(screen.queryByText("Fixture release")).toBeNull());
});

it("hides a previously loaded case after access or evidence read failure", async () => {
  let denied = false;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url, init) => {
      if (denied)
        return Response.json({ error: "Unavailable" }, { status: 403 });
      return Response.json(
        JSON.parse(init.body).action === "list_release_cases"
          ? { cases: [item] }
          : projection,
      );
    }),
  );
  render(<ReleaseCasesPage />);
  fireEvent.click(
    await screen.findByRole("button", { name: /Open saved release/ }),
  );
  await screen.findByText("Fixture release");
  denied = true;
  fireEvent.click(screen.getByRole("button", { name: "Reload case" }));
  await screen.findByRole("alert");
  expect(screen.queryByText("Fixture release")).toBeNull();
});

it("does not allow a review of a truncated release", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url, init) =>
      Response.json(
        JSON.parse(init.body).action === "list_release_cases"
          ? { cases: [item] }
          : {
              ...projection,
              reviewable: false,
              track_page: { hasMore: true },
            },
      ),
    ),
  );
  render(<ReleaseCasesPage />);
  fireEvent.click(
    await screen.findByRole("button", { name: /Open saved release/ }),
  );
  await screen.findByText("Fixture release");
  expect(
    (
      screen.getByRole("button", {
        name: "Mark metadata reviewed",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
});

it("offers a route back to chat when no saved releases exist", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => Response.json({ cases: [] })),
  );
  render(<ReleaseCasesPage />);
  await screen.findByText("No saved releases yet.");
  expect(
    screen.getByRole("link", { name: "Open chat" }).getAttribute("href"),
  ).toBe("/");
});
it("identifies expired authentication without exposing raw response errors", async () => {
  state.token = null;
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  render(<ReleaseCasesPage />);
  expect((await screen.findByRole("alert")).textContent).toContain(
    "Please sign in again.",
  );
  expect(fetcher).not.toHaveBeenCalled();
});
