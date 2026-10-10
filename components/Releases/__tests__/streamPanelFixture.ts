import { vi } from "vitest";
import { history } from "./streamFixture";
export const data = {
  catalogs: [{ id: "preview-catalog", name: "Sample catalog" }],
  catalogId: "preview-catalog",
  selectCatalog: vi.fn(),
  days: 28,
  setDays: vi.fn(),
  since: null,
  setRange: vi.fn(),
  catalogsLoading: false,
  catalogError: "",
  history,
  tracking: {
    catalog_id: "preview-catalog",
    tracking: { enabled: true },
    latest_run: { status: "complete", finished_at: null },
  },
  error: "",
  loading: false,
  enabling: false,
  mutationError: "",
  enable: vi.fn(),
  retryCatalogs: vi.fn(),
  refresh: vi.fn(),
};
