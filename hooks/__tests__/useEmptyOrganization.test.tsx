// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useEmptyOrganization } from "../useEmptyOrganization";
const state = vi.hoisted(() => ({
  org: { selectedOrgId: "org", isInitialized: true },
  roster: { artists: [] as unknown[], isLoading: false, isError: false },
}));
vi.mock("@/providers/OrganizationProvider", () => ({
  useOrganization: () => state.org,
}));
vi.mock("@/providers/ArtistProvider", () => ({
  useArtistProvider: () => state.roster,
}));
describe("useEmptyOrganization", () => {
  it.each([
    ["empty organization", "org", true, false, false, 0, true],
    ["personal", null, true, false, false, 0, false],
    ["restoring workspace", "org", false, false, false, 0, false],
    ["loading roster", "org", true, true, false, 0, false],
    ["failed roster", "org", true, false, true, 0, false],
    ["populated roster", "org", true, false, false, 1, false],
  ])(
    "handles %s",
    (
      _label,
      selectedOrgId,
      isInitialized,
      isLoading,
      isError,
      count,
      expected,
    ) => {
      Object.assign(state.org, { selectedOrgId, isInitialized });
      Object.assign(state.roster, {
        isLoading,
        isError,
        artists: Array(count).fill({}),
      });
      expect(renderHook(() => useEmptyOrganization()).result.current).toBe(
        expected,
      );
    },
  );
});
