import { describe, expect, it } from "vitest";
import { buildFirstTaskParams } from "@/lib/onboarding/buildFirstTaskParams";
import { buildFirstTaskPrompt } from "@/lib/onboarding/buildFirstTaskPrompt";
import { getFirstTaskSchedule } from "@/lib/onboarding/getFirstTaskSchedule";

const input = {
  artistName: "Luh Tyler",
  artistAccountId: "artist-123",
  recipientEmail: "manager@example.com",
  catalogName: "Debut",
  now: new Date(2026, 7, 14, 15, 20),
};

describe("buildFirstTaskParams", () => {
  it("builds POST /api/tasks params with a personalized title", () => {
    const params = buildFirstTaskParams(input);
    expect(params).toEqual({
      title: "Monthly Catalog Report: Luh Tyler",
      prompt: buildFirstTaskPrompt({
        artistName: "Luh Tyler",
        artistAccountId: "artist-123",
        recipientEmail: "manager@example.com",
        catalogName: "Debut",
      }),
      schedule: getFirstTaskSchedule(new Date(2026, 7, 14, 15, 20)),
      artist_account_id: "artist-123",
    });
  });

  it("uses the exact prompt the pre-run showed, so the scheduled task matches the preview", () => {
    const params = buildFirstTaskParams(input);
    expect(params.prompt).toBe(buildFirstTaskPrompt(input));
  });

  it("threads the recipient email into the scheduled prompt so the monthly report is emailed", () => {
    const params = buildFirstTaskParams(input);
    expect(params.prompt).toContain("manager@example.com");
  });
});

describe("buildFirstTaskParams timezone", () => {
  it("passes the caller's timezone through so the run time means the user's local time", () => {
    const params = buildFirstTaskParams({
      ...input,
      timezone: "America/Los_Angeles",
    });
    expect(params.timezone).toBe("America/Los_Angeles");
  });

  it("omits timezone when none is known (API default zone)", () => {
    const params = buildFirstTaskParams(input);
    expect(params).not.toHaveProperty("timezone");
  });
});
