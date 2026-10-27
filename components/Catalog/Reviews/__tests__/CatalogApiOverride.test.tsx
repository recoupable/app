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
import ApiOverrideSync from "@/providers/ApiOverrideSync";
import { API_OVERRIDE_STORAGE_KEY, NEW_API_BASE_URL } from "@/lib/consts";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import CatalogReviewsPage from "../CatalogReviewsPage";

const routing = vi.hoisted(() => ({ query: "" }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(routing.query),
}));
vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({
    ready: true,
    authenticated: true,
    user: { id: "privy:actor" },
    getAccessToken: async () => "token",
    login: vi.fn(),
  }),
}));
vi.mock("@/providers/UserProvder", () => ({
  useUserProvider: () => ({
    userData: { account_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" },
  }),
}));
vi.mock("@/providers/OrganizationProvider", () => ({
  useOrganization: () => ({ selectedOrgId: null, isInitialized: true }),
}));

function Harness() {
  // The page reads storage during render; URL synchronization runs later.
  return (
    <>
      <CatalogReviewsPage />
      <ApiOverrideSync />
    </>
  );
}
const freshId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const staleId = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
function page(id: string) {
  return {
    cases: [
      {
        case_id: id,
        revision: 1,
        created_at: "2026-10-26T01:00:00Z",
        updated_at: "2026-10-26T01:00:00Z",
      },
    ],
    has_more: false,
    next_id: null,
  };
}
function applyQuery(mode: string) {
  routing.query = new URLSearchParams({
    api: mode === "clear" ? "clear" : "https://preview.example/",
  }).toString();
}
beforeEach(() => {
  routing.query = "";
  window.sessionStorage.clear();
});
afterEach(() => {
  cleanup();
  window.sessionStorage.clear();
  vi.unstubAllGlobals();
});

it.each(["override", "clear"])(
  "loads after %s query synchronizes later than the initial page render",
  async (mode) => {
    if (mode === "clear")
      window.sessionStorage.setItem(
        API_OVERRIDE_STORAGE_KEY,
        "https://old-preview.example",
      );
    applyQuery(mode);
    const fetcher = vi.fn(async (url, init) => {
      // The override only invalidates scope; it never receives credentials or Context requests.
      expect(url).toBe("/api/context");
      expect(init.headers.Authorization).toBe("Bearer token");
      return Response.json(page(freshId));
    });
    vi.stubGlobal("fetch", fetcher);
    render(<Harness />);
    await screen.findByRole("button", { name: /Audit bbbbbbbb/ });
    expect(getClientApiBaseUrl()).toBe(
      mode === "clear" ? NEW_API_BASE_URL : "https://preview.example",
    );
    expect(screen.queryByText("Loading audit…")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
  },
);

it.each(["override", "clear"])(
  "aborts stale reads and lists again after a live %s query update",
  async (mode) => {
    if (mode === "clear")
      window.sessionStorage.setItem(
        API_OVERRIDE_STORAGE_KEY,
        "https://old-preview.example",
      );
    let resolve!: (value: Response) => void;
    let staleSignal: AbortSignal | undefined;
    let calls = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url, init) => {
        expect(url).toBe("/api/context");
        if (++calls === 1) {
          staleSignal = init.signal;
          return new Promise<Response>((done) => {
            resolve = done;
          });
        }
        return Response.json(page(freshId));
      }),
    );
    const view = render(<Harness />);
    await waitFor(() => expect(calls).toBe(1));
    applyQuery(mode);
    view.rerender(<Harness />);
    await screen.findByRole("button", { name: /Audit bbbbbbbb/ });
    expect(staleSignal?.aborted).toBe(true);
    await act(async () => resolve(Response.json(page(staleId))));
    expect(screen.queryByRole("button", { name: /Audit cccccccc/ })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
    await waitFor(() => expect(calls).toBe(3));
    expect(screen.queryByText("Loading audit…")).toBeNull();
  },
);
