import { describe, expect, it } from "vitest";
import { filterCatalogsByOrg } from "@/lib/catalog/filterCatalogsByOrg";
import type { Catalog } from "@/types/Catalog";

const DUETTI = "5d511b7e-de11-4566-ae90-b5fd5535d900";
const SWEETS = "fb678396-a68f-4294-ae50-b8cacf9ce77b";

const catalog = (id: string, ownerId: string | null): Catalog => ({
  id,
  name: `Catalog ${id}`,
  created_at: "2026-08-06T04:10:06.974381+00:00",
  updated_at: "2026-08-06T04:10:06.974381+00:00",
  owner: ownerId
    ? {
        id: ownerId,
        name: null,
        image: null,
        is_organization: ownerId === DUETTI,
      }
    : null,
});

const personal = catalog("personal", SWEETS);
const orgOwned = catalog("org", DUETTI);
const unattributed = catalog("unattributed", null);

describe("filterCatalogsByOrg", () => {
  it("shows everything the account can see on the personal account", () => {
    const catalogs = [personal, orgOwned, unattributed];

    expect(filterCatalogsByOrg(catalogs, null)).toEqual(catalogs);
  });

  it("keeps only the selected organization's catalogs", () => {
    expect(filterCatalogsByOrg([personal, orgOwned], DUETTI)).toEqual([
      orgOwned,
    ]);
  });

  it("drops a catalog whose owner the API could not attribute", () => {
    expect(filterCatalogsByOrg([unattributed], DUETTI)).toEqual([]);
  });

  it("returns nothing for an organization that owns no catalogs", () => {
    expect(
      filterCatalogsByOrg([personal], "04e3aba9-c130-4fb8-8b92-34e95d43e66b"),
    ).toEqual([]);
  });
});
