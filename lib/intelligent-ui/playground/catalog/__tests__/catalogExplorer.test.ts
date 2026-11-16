import { describe, expect, it } from "vitest";
import { createCatalogExplorerFixture } from "../createCatalogExplorerFixture";
import { getCatalogExplorerView } from "../getCatalogExplorerView";
import { compareCatalogSelection } from "../compareCatalogSelection";
import { componentSchema } from "../../../schema";

describe("synthetic catalog explorer", () => {
  it("keeps 10,000 exact identities and bounds each portable page to25", () => {
    const rows = createCatalogExplorerFixture();
    expect(rows).toHaveLength(10000);
    expect(new Set(rows.map((r) => r.id)).size).toBe(10000);
    const view = getCatalogExplorerView(rows, {
      query: "",
      cohort: "all",
      descending: false,
      page: 1,
    });
    expect(view.collection.rows).toHaveLength(25);
    expect(view.collection.totalCount).toBe(10000);
    expect(view.collection.complete).toBe(false);
    expect(componentSchema.safeParse(view.collection).success).toBe(true);
    expect(
      view.coverage.known +
        view.coverage.unknown +
        view.coverage.withheld +
        view.coverage.notApplicable,
    ).toBe(10000);
  });
  it("filters deterministically, clamps pages, sorts without mutating source values", () => {
    const rows = createCatalogExplorerFixture();
    const before = JSON.stringify(rows);
    const options = {
      query: "Recording 000",
      cohort: "all",
      descending: true,
      page: 999,
    };
    const view = getCatalogExplorerView(rows, options);
    expect(view.page).toBe(view.pages);
    expect(
      view.collection.rows[0].label > view.collection.rows.at(-1)!.label,
    ).toBe(true);
    expect(JSON.stringify(rows)).toBe(before);
    expect(getCatalogExplorerView(rows, options)).toEqual(view);
    const empty = getCatalogExplorerView(rows, {
      ...options,
      query: "does not exist",
    });
    expect(empty.collection.rows).toEqual([]);
    expect(empty.collection.totalCount).toBe(0);
  });
  it("retains zero and refuses missingness rather than inventing values", () => {
    const rows = createCatalogExplorerFixture();
    const known = rows
      .filter((r) => r.value.state === "known" && r.cohort === "luminate")
      .slice(0, 2);
    const zero = { ...known[0], value: { state: "known" as const, amount: 0 } };
    const result = compareCatalogSelection([zero, known[1]]);
    expect(result.reason).toBeNull();
    expect(result.distribution?.items[0].value).toBe(0);
    for (const state of ["unknown", "withheld", "not-applicable"] as const)
      expect(
        compareCatalogSelection([{ ...zero, value: { state } }, known[1]])
          .reason,
      ).toContain("missing");
  });
  it("refuses incompatible basis and hypothetical values without changing either record", () => {
    const pair = createCatalogExplorerFixture()
      .filter((r) => r.value.state === "known" && r.cohort === "luminate")
      .slice(0, 2);
    for (const changes of [
      { unit: "listeners" },
      { currency: "EUR" },
      { periodStart: null },
      { periodEnd: "2026-10-01" },
      { cohort: "spotify" },
      { territory: "US" },
      { metric: "cumulative_plays" },
      { sourceVersion: "other" },
      { role: "hypothetical" as const },
    ]) {
      const changed = { ...pair[1], ...changes };
      const before = JSON.stringify(changed);
      expect(compareCatalogSelection([pair[0], changed]).reason).toBeTruthy();
      expect(JSON.stringify(changed)).toBe(before);
    }
  });
  it("shares chart arithmetic only within a complete selected count basis", () => {
    const pair = createCatalogExplorerFixture()
      .filter((r) => r.value.state === "known" && r.cohort === "luminate")
      .slice(0, 2);
    const result = compareCatalogSelection(pair);
    expect(result.reason).toBeNull();
    expect(result.distribution?.totalCount).toBe(2);
    expect(result.distribution?.measure.population).toContain("selected");
    expect(result.total).toBe(
      pair.reduce(
        (n, r) => n + (r.value.state === "known" ? r.value.amount : 0),
        0,
      ),
    );
    expect(compareCatalogSelection([]).reason).toBeTruthy();
    expect(compareCatalogSelection([pair[0], pair[0]]).reason).toBeTruthy();
  });
  it("keeps compatible cash values unaggregated and refuses absent currency", () => {
    const pair = createCatalogExplorerFixture()
      .filter(
        (r) =>
          r.cohort === "cash" &&
          r.currency === "USD" &&
          r.value.state === "known",
      )
      .slice(0, 2);
    expect(compareCatalogSelection(pair)).toEqual({
      reason: null,
      distribution: null,
      total: null,
    });
    expect(
      compareCatalogSelection([pair[0], { ...pair[1], currency: null }]).reason,
    ).toContain("missing");
    expect(
      compareCatalogSelection([pair[0], { ...pair[1], currency: "EUR" }])
        .reason,
    ).toContain("currency");
  });
});
