import { describe, expect, it } from "vitest";
import { validateCronExpression } from "@/lib/tasks/validateCronExpression";

describe("validateCronExpression", () => {
  it("accepts a valid 5-field cron", () => {
    expect(validateCronExpression("0 9 * * *")).toBeNull();
  });

  it("rejects wrong field count", () => {
    expect(validateCronExpression("1 2 3")).not.toBeNull();
  });

  it("rejects empty string", () => {
    expect(validateCronExpression("   ")).not.toBeNull();
  });
});
