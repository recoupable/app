import { describe, expect, it } from "vitest";
import {
  getCronHumanPreview,
  validateCronExpression,
} from "@/lib/tasks/validateCronExpression";

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

describe("getCronHumanPreview", () => {
  it("returns human text for valid cron", () => {
    const preview = getCronHumanPreview("0 9 * * *");
    expect(preview).toBeTruthy();
    expect(preview!.length).toBeGreaterThan(10);
  });

  it("returns null for invalid cron", () => {
    expect(getCronHumanPreview("not-a-cron")).toBeNull();
  });
});
