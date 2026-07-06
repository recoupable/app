import { describe, expect, it } from "vitest";
import { buildStarterTaskParams } from "@/lib/home/buildStarterTaskParams";

describe("buildStarterTaskParams", () => {
  const params = buildStarterTaskParams({
    artistName: "Del Water Gap",
    artistAccountId: "artist-1",
  });

  it("titles the task after the artist", () => {
    expect(params.title).toBe(
      "Weekly valuation + streams report for Del Water Gap",
    );
  });

  it("schedules Mondays", () => {
    expect(params.schedule).toBe("0 9 * * 1");
  });

  it("targets the artist account", () => {
    expect(params.artist_account_id).toBe("artist-1");
  });

  it("prompts for a valuation + streams report about the artist", () => {
    expect(params.prompt).toContain("Del Water Gap");
    expect(params.prompt.toLowerCase()).toContain("valuation");
    expect(params.prompt.toLowerCase()).toContain("stream");
  });
});
