import { describe, expect, it } from "vitest";
import { getCronHumanPreview } from "@/lib/tasks/getCronHumanPreview";

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
