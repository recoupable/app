import { componentSchema } from "../../schema";
import type { DistributionComponent } from "../../representations/schemas";
import { computeDistribution } from "../../representations/computeDistribution";
import type { CatalogExplorerRecord } from "./catalogExplorerTypes";

/** Compatibility only. Financial/growth/scenario arithmetic remains with Catalog. */
export function compareCatalogSelection(
  records: readonly CatalogExplorerRecord[],
): {
  reason: string | null;
  distribution: DistributionComponent | null;
  total: number | null;
} {
  const refused = (reason: string) => ({
    reason,
    distribution: null,
    total: null,
  });
  if (records.length < 2 || records.length > 8)
    return refused("Select two to eight recordings for comparison.");
  if (new Set(records.map((r) => r.id)).size !== records.length)
    return refused("Duplicate recording identity.");
  if (records.some((r) => r.value.state !== "known"))
    return refused(
      "Comparison unavailable: missing, withheld or not-applicable values are not zero.",
    );
  if (records.some((r) => r.role !== "observed"))
    return refused(
      "Hypothetical values stay separate from observations. No approved scenario method is supplied.",
    );
  if (
    records.some(
      (r) =>
        !r.periodStart ||
        !r.periodEnd ||
        !r.unit ||
        (r.unit === "currency units" && !r.currency),
    )
  )
    return refused(
      "Comparison unavailable: a period, unit or currency is missing. Cumulative observations are not period streams.",
    );
  const keys = [
    "cohort",
    "sourceVersion",
    "metric",
    "unit",
    "currency",
    "periodStart",
    "periodEnd",
    "territory",
  ] as const;
  const mismatch = keys.find((key) =>
    records.some((r) => r[key] !== records[0][key]),
  );
  if (mismatch)
    return refused(
      `Comparison unavailable: incompatible ${mismatch}. Choose the same source, period, unit, currency and cohort.`,
    );
  // Preserve compatible money as labeled source values; never invent finance arithmetic.
  if (records[0].currency)
    return { reason: null, distribution: null, total: null };
  const first = records[0];
  const distribution: DistributionComponent = {
    type: "distribution",
    id: "synthetic-selected-recordings",
    title: "Selected observations",
    measure: {
      label: `${first.cohort} · ${first.metric}`,
      unit: first.unit!,
      periodStart: first.periodStart!,
      periodEnd: first.periodEnd!,
      population: `${records.length} selected synthetic recordings; not a catalog total`,
    },
    items: records.map((r) => ({
      id: r.id,
      label: r.label,
      value: r.value.state === "known" ? r.value.amount : 0,
      evidenceIds: [],
    })),
    complete: true,
    totalCount: records.length,
  };
  if (!componentSchema.safeParse(distribution).success)
    return refused(
      "Comparison unavailable: invalid measurement basis or source value.",
    );
  return {
    reason: null,
    distribution,
    total: computeDistribution(distribution).total,
  };
}
