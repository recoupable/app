import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
const source = vi.hoisted(() => ({
  catalogs: vi.fn(),
  history: vi.fn(),
  request: vi.fn(),
}));
vi.mock("@/lib/releases/getReleaseStreamCatalogs", () => ({
  getReleaseStreamCatalogs: source.catalogs,
}));
vi.mock("@/lib/releases/getReleaseStreamHistory", () => ({
  getReleaseStreamHistory: source.history,
}));
vi.mock("@/lib/releases/requestStreamData", () => ({
  requestStreamData: source.request,
}));
export const tracking = (id: string, status = "complete") => ({
  catalog_id: id,
  tracking: { enabled: true },
  latest_run: { status, finished_at: null },
});
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

export { source };
