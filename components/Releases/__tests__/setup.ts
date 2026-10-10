import type { ReactElement } from "react";
import {
  cleanup,
  fireEvent,
  render as renderUI,
  screen,
} from "@testing-library/react";
import { afterEach, vi } from "vitest";
const mockState = vi.hoisted(() => ({
  org: "org-a",
  authenticated: true,
  token: "token" as string | null,
}));
export const state = mockState;
vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({
    authenticated: mockState.authenticated,
    ready: true,
    getAccessToken: async () => mockState.token,
    login: vi.fn(),
  }),
}));
vi.mock("@/providers/UserProvder", () => ({
  useUserProvider: () => ({ userData: { account_id: "actor" } }),
}));
vi.mock("@/providers/OrganizationProvider", () => ({
  useOrganization: () => ({
    selectedOrgId: mockState.org,
    isInitialized: true,
  }),
}));
export const item = {
  request_id: "request",
  url: "https://open.spotify.com/album/example",
  created_at: "2026-10-08T15:00:00Z",
  status: "partial",
};
export const projection = {
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
  mockState.org = "org-a";
  mockState.authenticated = true;
  mockState.token = "token";
});

// Keep metadata-review tests focused on that independent workflow.
vi.mock("../CatalogReleaseStreams", () => ({ default: () => null }));
export function render(element: ReactElement) {
  const result = renderUI(element);
  const summary = screen.queryByText("Metadata reviews");
  if (summary) fireEvent.click(summary);
  return result;
}
