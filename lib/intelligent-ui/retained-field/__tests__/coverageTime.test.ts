import { expect, it } from "vitest";
import { fieldContextSchema } from "../schemas";
import { consumeRetainedField } from "../consumeRetainedField";
import { projectRetainedField } from "../projectRetainedField";
import { fixture } from "./fixture";

it.each(["not-a-date", "2026-02-30", "", "999999-01-01"])(
  "invalid since %s refuses safely without a refinement exception",
  (since) => {
    const f = fixture();
    f.part.data.fieldContext.query.since = since;
    expect(() =>
      fieldContextSchema.safeParse(f.part.data.fieldContext),
    ).not.toThrow();
    expect(fieldContextSchema.safeParse(f.part.data.fieldContext).success).toBe(
      false,
    );
    expect(consumeRetainedField(f.part, f.admission)).toEqual({
      state: "unavailable",
    });
  },
);
it.each(["absentDateCount", "nullDateCount", "missingDateCount"] as const)(
  "bounds %s by the actual two periods",
  (key) => {
    const f = fixture();
    const item = f.part.data.fieldContext.items[1];
    item.coverage[key] = 5; // Two two-day periods contain four dates, not 732.
    expect(fieldContextSchema.safeParse(f.part.data.fieldContext).success).toBe(
      false,
    );
    expect(consumeRetainedField(f.part, f.admission)).toEqual({
      state: "unavailable",
    });
  },
);
it.each(["known-gap", "incomplete-no-gap", "count-sum"])(
  "refuses evaluator-impossible %s coverage",
  (mode) => {
    const f = fixture();
    const coverage =
      f.part.data.fieldContext.items[mode === "known-gap" ? 0 : 1].coverage;
    if (mode === "known-gap") {
      coverage.absentDateCount = 1;
      coverage.missingDateCount = 1;
    }
    if (mode === "incomplete-no-gap") {
      coverage.absentDateCount = 0;
      coverage.missingDateCount = 0;
    }
    if (mode === "count-sum") {
      coverage.nullDateCount = 1;
    }
    expect(fieldContextSchema.safeParse(f.part.data.fieldContext).success).toBe(
      false,
    );
    expect(consumeRetainedField(f.part, f.admission)).toEqual({
      state: "unavailable",
    });
  },
);
it("rejects retrieval after evaluation and unfinished comparison periods", () => {
  for (const asOf of ["2026-10-03T01:59:59Z", "2026-10-02T23:59:59Z"]) {
    const f = fixture();
    f.part.data.fieldContext.asOf = asOf;
    if (asOf === "2026-10-02T23:59:59Z") {
      // Keep retrieval before asOf so only the unfinished period causes refusal.
      for (const item of f.part.data.fieldContext.items) {
        item.source.retrievalRange = {
          earliest: "2026-10-02T01:00:00Z",
          latest: "2026-10-02T02:00:00Z",
        };
      }
    }
    expect(fieldContextSchema.safeParse(f.part.data.fieldContext).success).toBe(
      false,
    );
    expect(consumeRetainedField(f.part, f.admission)).toEqual({
      state: "unavailable",
    });
  }
});
it("accepts evaluator-consistent zero/unknown with boundary counts and retrieval exactly at asOf", () => {
  const f = fixture();
  const context = f.part.data.fieldContext;
  context.asOf = context.items[0].source.retrievalRange.latest;
  context.items[1].coverage = {
    comparisonState: "incomplete",
    absentDateCount: 3,
    nullDateCount: 1,
    missingDateCount: 4,
  };
  expect(fieldContextSchema.safeParse(context).success).toBe(true);
  f.part.data.surface = projectRetainedField(context, "retained-1", 1).surface;
  const result = consumeRetainedField(f.part, f.admission);
  expect(result.state).toBe("ready");
  if (result.state === "ready") {
    expect(result.collection.items.map((item) => item.field.value)).toEqual([
      { state: "known", amount: 0 },
      { state: "unknown" },
    ]);
    expect(result.fieldContext.items[1].coverage.missingDateCount).toBe(4);
  }
});
