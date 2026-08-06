import { describe, expect, it } from "vitest";
import { resolveSelectedOrgId } from "@/lib/catalog/resolveSelectedOrgId";

const DUETTI = "5d511b7e-de11-4566-ae90-b5fd5535d900";
const RECOUP = "04e3aba9-c130-4fb8-8b92-34e95d43e66b";

const memberships = [
  { id: "1", organization_id: DUETTI, organization_name: "Duetti" },
  { id: "2", organization_id: RECOUP, organization_name: "Recoup" },
];

describe("resolveSelectedOrgId", () => {
  it("keeps a selection this account is a member of", () => {
    expect(resolveSelectedOrgId(DUETTI, memberships)).toBe(DUETTI);
  });

  it("falls back to personal for a selection this account is not in", () => {
    // The selection is persisted, so it survives signing in as someone else or
    // losing membership. Filtering on it would empty the page and name an
    // organization the viewer cannot see.
    expect(
      resolveSelectedOrgId("an-org-from-a-previous-account", memberships),
    ).toBeNull();
  });

  it("falls back to personal when the account belongs to no organizations", () => {
    expect(resolveSelectedOrgId(DUETTI, [])).toBeNull();
  });

  it("keeps the selection while memberships are still loading", () => {
    // undefined means "not loaded yet", not "no memberships" — resetting here
    // would flash the whole union on every mount.
    expect(resolveSelectedOrgId(DUETTI, undefined)).toBe(DUETTI);
  });

  it("passes personal through untouched", () => {
    expect(resolveSelectedOrgId(null, memberships)).toBeNull();
    expect(resolveSelectedOrgId(null, undefined)).toBeNull();
  });
});
