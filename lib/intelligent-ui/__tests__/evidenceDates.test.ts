import { describe, expect, it } from "vitest";
import { evidenceSchema } from "../schema";

const evidence = {
  id: "source",
  label: "Source",
  sourceLabel: "Example",
  text: "Example evidence",
  kind: "submitted",
  status: "current",
};

describe("evidence timestamps", () => {
  it.each(["+99:99", "+24:00", "+23:60", "-99:99"])(
    "rejects an ISO-shaped timestamp with an invalid offset %s",
    (offset) => {
      expect(
        evidenceSchema.safeParse({
          ...evidence,
          observedAt: `2026-10-16T14:54:57${offset}`,
        }).success,
      ).toBe(false);
    },
  );

  it.each(["Z", "+05:30", "-04:00"])(
    "preserves a valid timezone offset %s",
    (offset) => {
      const value = { ...evidence, observedAt: `2026-10-16T14:54:57${offset}` };
      expect(evidenceSchema.parse(value)).toEqual(value);
    },
  );
});
