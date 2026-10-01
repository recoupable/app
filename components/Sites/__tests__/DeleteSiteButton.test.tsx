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
import { DeleteSiteButton } from "../DeleteSiteButton";
import type { Site } from "@/lib/sites/schema";
const m = vi.hoisted(() => ({
  request: vi.fn(),
  invalidate: vi.fn(),
  remove: vi.fn(),
}));
vi.mock("@/hooks/useSitesRequest", () => ({
  useSitesRequest: () => m.request,
}));
vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    invalidateQueries: m.invalidate,
    removeQueries: m.remove,
  }),
}));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  sessionStorage.clear();
});
const site = { id: "site", name: "Album", revision: 1, published: {} } as Site;
it("requires confirmation and deletes the current revision with the existing job handle", async () => {
  sessionStorage.setItem("site-production:site", "signed-job");
  m.request
    .mockResolvedValueOnce({ site: { revision: 3 } })
    .mockResolvedValueOnce({ deleted: true });
  const done = vi.fn();
  render(<DeleteSiteButton site={site} onDeleted={done} />);
  fireEvent.click(screen.getByRole("button", { name: "Delete Album" }));
  expect(m.request).not.toHaveBeenCalled();
  expect(screen.getByText(/published page will go offline/)).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Delete site" }));
  await waitFor(() => expect(done).toHaveBeenCalledOnce());
  expect(JSON.parse(m.request.mock.calls[1][1].body)).toEqual({
    action: "delete",
    revision: 3,
    generationToken: "signed-job",
  });
  expect(sessionStorage.getItem("site-production:site")).toBeNull();
});
it("keeps the dialog and job handle on a failed delete", async () => {
  sessionStorage.setItem("site-production:site", "job");
  m.request.mockRejectedValueOnce(new Error("Could not delete"));
  const done = vi.fn();
  render(<DeleteSiteButton site={site} onDeleted={done} />);
  fireEvent.click(screen.getByRole("button", { name: "Delete Album" }));
  fireEvent.click(screen.getByRole("button", { name: "Delete site" }));
  await screen.findByRole("alert");
  expect(done).not.toHaveBeenCalled();
  expect(sessionStorage.getItem("site-production:site")).toBe("job");
});
