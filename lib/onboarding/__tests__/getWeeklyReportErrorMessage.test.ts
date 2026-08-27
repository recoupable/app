import { describe, expect, it } from "vitest";
import { getWeeklyReportErrorMessage } from "@/lib/onboarding/getWeeklyReportErrorMessage";

// One copy table for both weekly-report entry points (onboarding confirm and
// the homepage card), keyed by the coded errors useWeeklyReportTaskInput throws.
describe("getWeeklyReportErrorMessage", () => {
  it("maps each coded failure to its copy", () => {
    expect(getWeeklyReportErrorMessage(new Error("ARTIST_REQUIRED"))).toBe(
      "Please select an artist first.",
    );
    expect(getWeeklyReportErrorMessage(new Error("EMAIL_REQUIRED"))).toBe(
      "Add an email address to your account to receive your weekly report.",
    );
    expect(getWeeklyReportErrorMessage(new Error("AUTH_REQUIRED"))).toBe(
      "Please sign in to schedule your weekly report.",
    );
  });

  it("falls back to a retry message for anything else", () => {
    expect(getWeeklyReportErrorMessage(new Error("HTTP 500: boom"))).toBe(
      "Couldn't schedule the weekly report. Please try again.",
    );
    expect(getWeeklyReportErrorMessage("nope")).toBe(
      "Couldn't schedule the weekly report. Please try again.",
    );
  });
});
