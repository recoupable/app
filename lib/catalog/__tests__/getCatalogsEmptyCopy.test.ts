import { describe, expect, it } from "vitest";
import { getCatalogsEmptyCopy } from "@/lib/catalog/getCatalogsEmptyCopy";

const DUETTI = "5d511b7e-de11-4566-ae90-b5fd5535d900";

describe("getCatalogsEmptyCopy", () => {
  it("says no catalogs at all on the personal account", () => {
    expect(getCatalogsEmptyCopy(null)).toBe("No catalogs found.");
  });

  it("names the organization whose list is empty", () => {
    // 8 of the 9 orgs this account belongs to own no catalogs, so this is the
    // org state users hit most; "No catalogs found." reads as data loss.
    expect(getCatalogsEmptyCopy(DUETTI, "Duetti")).toBe(
      "No catalogs in Duetti yet.",
    );
  });

  it("falls back when the organization's name has not loaded", () => {
    expect(getCatalogsEmptyCopy(DUETTI)).toBe(
      "No catalogs in this organization yet.",
    );
  });
});
