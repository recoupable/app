// @vitest-environment jsdom
import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import useHomeValuation from "@/hooks/useHomeValuation";
const state = vi.hoisted(() => ({
  org: null as string | null,
  artist: { account_id: "artist", name: "Artist" } as {
    account_id: string;
    name: string;
  } | null,
  measure: vi.fn(),
  derive: vi.fn(),
}));
vi.mock("@/providers/OrganizationProvider", () => ({
  useOrganization: () => ({ selectedOrgId: state.org }),
}));
vi.mock("@/providers/UserProvder", () => ({
  useUserProvider: () => ({ userData: { account_id: "user" } }),
}));
vi.mock("@/providers/ArtistProvider", () => ({
  useArtistProvider: () => ({ selectedArtist: state.artist }),
}));
vi.mock("@/hooks/useCatalogs", () => ({
  default: () => ({
    data: {
      catalogs: [
        { id: "org-catalog", owner: { id: "org" } },
        { id: "personal-catalog", owner: { id: "user" } },
      ],
    },
  }),
}));
vi.mock("@/hooks/useCatalogMeasurements", () => ({
  default: (...args: unknown[]) => {
    state.measure(...args);
    return {};
  },
}));
vi.mock("@/lib/home/getValuationHeroState", () => ({
  getValuationHeroState: (...args: unknown[]) => {
    state.derive(...args);
    return { show: false };
  },
}));
afterEach(cleanup);
beforeEach(() => {
  state.org = null;
  state.artist = { account_id: "artist", name: "Artist" };
  vi.clearAllMocks();
});
describe("home valuation scope", () => {
  it("uses the personal catalog rather than the first catalog in the account list", () => {
    renderHook(useHomeValuation);
    expect(state.measure).toHaveBeenCalledWith("personal-catalog", "artist", 1);
  });
  it("uses the selected organization's catalog", () => {
    state.org = "org";
    renderHook(useHomeValuation);
    expect(state.measure).toHaveBeenCalledWith("org-catalog", "artist", 1);
  });
  it("does not misrepresent one catalog as an All artists workspace aggregate", () => {
    state.artist = null;
    renderHook(useHomeValuation);
    expect(state.measure).toHaveBeenCalledWith(undefined, undefined, 1);
    expect(state.derive).toHaveBeenCalledWith(
      expect.objectContaining({ catalog: undefined }),
    );
  });
  it("does not fall back to another workspace's catalog", () => {
    state.org = "empty-org";
    renderHook(useHomeValuation);
    expect(state.measure).toHaveBeenCalledWith(undefined, "artist", 1);
  });
});
