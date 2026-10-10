// @vitest-environment jsdom
import React from "react";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import ReleaseCasesPage from "../ReleaseCasesPage";
import { history } from "./streamFixture";
import type { StreamPoint } from "@/lib/releases/streamTypes";
vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({
    ready: true,
    authenticated: true,
    getAccessToken: async () => "viewer",
  }),
}));
vi.mock("@/providers/UserProvder", () => ({
  useUserProvider: () => ({ userData: { account_id: "actor" } }),
}));
vi.mock("@/providers/OrganizationProvider", () => ({
  useOrganization: () => ({ selectedOrgId: "org", isInitialized: true }),
}));
vi.mock("next/dynamic", () => ({
  default:
    () =>
    ({ points }: { points: StreamPoint[] }) => (
      <p data-testid="chart">{JSON.stringify(points)}</p>
    ),
}));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
it("charts catalog albums in the actual Releases page when no metadata review exists", async () => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-10-09T12:00:00Z"));
  const fetcher = vi.fn(async (url: string, init: RequestInit) => {
    if (init.method === "POST")
      return Response.json({ cases: [], has_more: false });
    if (url.includes("accounts/actor/catalogs"))
      return Response.json({
        catalogs: [
          { id: "preview-catalog", name: "Gatsby Grace", owner: { id: "org" } },
        ],
      });
    if (url.includes("catalogs/songs"))
      return Response.json({
        status: "success",
        songs: [
          {
            catalog_id: "preview-catalog",
            isrc: "USABC2600001",
            name: "First",
            album: "ADHD",
          },
          {
            catalog_id: "preview-catalog",
            isrc: "USABC2600002",
            name: "Second",
            album: "Beautiful Tomorrow",
          },
        ],
        pagination: { page: 1, limit: 100, total_count: 2, total_pages: 1 },
      });
    if (url.includes("stream-tracking"))
      return Response.json({
        catalog_id: "preview-catalog",
        tracking: { enabled: true },
        latest_run: { status: "complete", finished_at: null },
      });
    if (url.includes("/streams?")) return Response.json(history);
    throw new Error(`Unexpected route: ${url}`);
  });
  vi.stubGlobal("fetch", fetcher);
  render(<ReleaseCasesPage />);
  const selector = await screen.findByLabelText("Release");
  expect(
    screen.getByText("Metadata reviews").parentElement?.hasAttribute("open"),
  ).toBe(false);
  const all = (await screen.findByTestId("chart")).textContent;
  fireEvent.change(selector, { target: { value: JSON.stringify("ADHD") } });
  expect(screen.getByTestId("chart").textContent).not.toBe(all);
  expect(screen.queryByRole("option", { name: "Second" })).toBeNull();
  fireEvent.change(screen.getByLabelText("Stream recording"), {
    target: { value: "USABC2600001" },
  });
  fireEvent.change(selector, {
    target: { value: JSON.stringify("Beautiful Tomorrow") },
  });
  expect(
    (screen.getByLabelText("Stream recording") as HTMLSelectElement).value,
  ).toBe("");
  expect(screen.getByRole("option", { name: "Second" })).toBeTruthy();
  expect(
    fetcher.mock.calls
      .filter(([, init]) => init.method === "POST")
      .map(([, init]) => JSON.parse(init.body as string).action),
  ).toEqual(["list_release_cases"]);
});
