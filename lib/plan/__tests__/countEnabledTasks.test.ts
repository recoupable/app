import { describe, expect, it } from "vitest";
import { countEnabledTasks } from "@/lib/plan/countEnabledTasks";

describe("countEnabledTasks", () => {
  it("counts only enabled tasks and tolerates a missing list", () => {
    expect(countEnabledTasks([{ enabled: true }, { enabled: false }, { enabled: null }, { enabled: true }])).toBe(2);
    expect(countEnabledTasks(undefined)).toBe(0);
  });
});
