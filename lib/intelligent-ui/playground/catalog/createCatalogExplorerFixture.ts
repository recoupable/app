import type { CatalogExplorerRecord } from "./catalogExplorerTypes";
import { catalogCohorts } from "./catalogExplorerTypes";

/** Fixed invented data; no connection, ingestion, finance method or rights inference. */
export function createCatalogExplorerFixture(): readonly CatalogExplorerRecord[] {
  const cohorts = Object.keys(catalogCohorts);
  return Array.from({ length: 10000 }, (_, i): CatalogExplorerRecord => {
    const cohort = cohorts[i % cohorts.length];
    const money = cohort === "cash" || cohort === "estimate";
    return {
      id: `synthetic:recording:${String(i).padStart(5, "0")}`,
      kind: "recording",
      label: `Recording ${String(i).padStart(5, "0")}`,
      cohort,
      sourceVersion: `synthetic-${cohort}-v1`,
      role: cohort === "estimate" ? "hypothetical" : "observed",
      metric:
        cohort === "luminate"
          ? "period_streams"
          : cohort === "spotify"
            ? "cumulative_plays"
            : cohort === "browser"
              ? "page_views"
              : cohort === "cash"
                ? "cash_receipts"
                : "estimated_value",
      unit: money ? "currency units" : cohort === "browser" ? "views" : "plays",
      currency: money ? (i % 2 === 0 ? "USD" : "EUR") : null,
      periodStart: cohort === "spotify" ? null : "2026-09-01",
      periodEnd: cohort === "spotify" ? null : "2026-09-30",
      territory: cohort === "luminate" ? "worldwide" : "unspecified",
      observedAt: "2026-10-15T12:00:00Z",
      value:
        i % 17 === 0
          ? { state: "unknown" }
          : i % 29 === 0
            ? { state: "withheld" }
            : i % 31 === 0
              ? { state: "not-applicable" }
              : {
                  state: "known",
                  amount: i % 13 === 0 ? 0 : (i * 37) % 100000,
                },
    };
  });
}
