import { describe, expect, it } from "vitest";
import { getChatRunPollInterval } from "@/lib/tasks/getChatRunPollInterval";

// The run page polls the workflow status every 3s, but must stop on a
// terminal status AND on a failed fetch, or a bad run id / revoked token
// becomes an endless request loop (chat#2010 review).
describe("getChatRunPollInterval", () => {
  it("polls while the run is queued or running", () => {
    expect(getChatRunPollInterval({ status: "queued", error: null })).toBe(
      3000,
    );
    expect(getChatRunPollInterval({ status: "running", error: null })).toBe(
      3000,
    );
    expect(getChatRunPollInterval({ status: undefined, error: null })).toBe(
      3000,
    );
  });

  it("stops on a terminal status", () => {
    for (const status of ["completed", "failed", "cancelled"] as const) {
      expect(getChatRunPollInterval({ status, error: null })).toBe(false);
    }
  });

  it("stops once the fetch has failed", () => {
    expect(
      getChatRunPollInterval({ status: undefined, error: new Error("404") }),
    ).toBe(false);
  });
});
