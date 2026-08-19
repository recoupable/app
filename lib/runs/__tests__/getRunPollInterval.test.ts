import { describe, expect, it } from "vitest";
import { getRunPollInterval } from "@/lib/runs/getRunPollInterval";
import type { ValuationRun } from "@/lib/runs/getRuns";

const run = (state: ValuationRun["state"]): ValuationRun =>
  ({ id: "r", kind: "valuation", state, album_count: 1, created_at: "t", result: null });

describe("getRunPollInterval", () => {
  it("polls while a run is queued", () => {
    expect(getRunPollInterval(run("queued"))).toBe(5000);
  });

  it("polls while a run is measuring", () => {
    expect(getRunPollInterval(run("measuring"))).toBe(5000);
  });

  it("stops polling once claimed", () => {
    expect(getRunPollInterval(run("claimed"))).toBe(false);
  });

  it("stops polling on failed", () => {
    expect(getRunPollInterval(run("failed"))).toBe(false);
  });

  it("does not poll when the account has no runs", () => {
    expect(getRunPollInterval(undefined)).toBe(false);
  });
});
