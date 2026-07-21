import { describe, expect, it } from "vitest";
import { getFirstTaskSchedule } from "@/lib/onboarding/getFirstTaskSchedule";
import { getCronHumanPreview } from "@/lib/tasks/getCronHumanPreview";

describe("getFirstTaskSchedule", () => {
  it("returns the Monday 9am weekly cron", () => {
    expect(getFirstTaskSchedule()).toBe("0 9 * * 1");
  });

  it("is a valid cron the existing human-preview helper can describe", () => {
    const preview = getCronHumanPreview(getFirstTaskSchedule());
    expect(preview).toContain("Monday");
  });
});
