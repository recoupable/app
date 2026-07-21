import { describe, expect, it } from "vitest";
import { buildFirstTaskParams } from "@/lib/onboarding/buildFirstTaskParams";
import { buildFirstTaskPrompt } from "@/lib/onboarding/buildFirstTaskPrompt";
import { getFirstTaskSchedule } from "@/lib/onboarding/getFirstTaskSchedule";

const input = {
  artistName: "Luh Tyler",
  artistAccountId: "artist-123",
  recipientEmail: "manager@example.com",
  catalogName: "Debut",
};

describe("buildFirstTaskParams", () => {
  it("builds POST /api/tasks params with a personalized title", () => {
    const params = buildFirstTaskParams(input);
    expect(params).toEqual({
      title: "Weekly Catalog Report — Luh Tyler",
      prompt: buildFirstTaskPrompt({
        artistName: "Luh Tyler",
        artistAccountId: "artist-123",
        recipientEmail: "manager@example.com",
        catalogName: "Debut",
      }),
      schedule: getFirstTaskSchedule(),
      artist_account_id: "artist-123",
    });
  });

  it("uses the exact prompt the pre-run showed, so the scheduled task matches the preview", () => {
    const params = buildFirstTaskParams(input);
    expect(params.prompt).toBe(buildFirstTaskPrompt(input));
  });

  it("threads the recipient email into the scheduled prompt so the weekly report is emailed", () => {
    const params = buildFirstTaskParams(input);
    expect(params.prompt).toContain("manager@example.com");
  });
});
