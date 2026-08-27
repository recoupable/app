import { describe, expect, it } from "vitest";
import { getRunHref } from "@/lib/tasks/getRunHref";

describe("getRunHref", () => {
  it("links a run to the top-level runs route, not under /tasks", () => {
    expect(getRunHref("run_06g3i0e3logru439uh9e1m8801")).toBe(
      "/runs/run_06g3i0e3logru439uh9e1m8801",
    );
  });
});
