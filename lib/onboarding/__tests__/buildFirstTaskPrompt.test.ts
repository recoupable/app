import { describe, expect, it } from "vitest";
import { buildFirstTaskPrompt } from "@/lib/onboarding/buildFirstTaskPrompt";

const base = {
  artistName: "Luh Tyler",
  artistAccountId: "artist-123",
  recipientEmail: "manager@example.com",
};

describe("buildFirstTaskPrompt", () => {
  it("names the artist and reads as a weekly streaming report brief", () => {
    const prompt = buildFirstTaskPrompt(base);
    expect(prompt).toContain("Luh Tyler");
    expect(prompt.toLowerCase()).toContain("weekly");
    expect(prompt.toLowerCase()).toContain("report");
  });

  it("embeds the recipient email so the scheduled agent knows where to send", () => {
    const prompt = buildFirstTaskPrompt(base);
    expect(prompt).toContain("manager@example.com");
  });

  it("instructs the agent to send the report as an email (the point of the task)", () => {
    const prompt = buildFirstTaskPrompt(base);
    expect(prompt.toLowerCase()).toContain("email");
    // mirrors the proven LA EQUIS send path
    expect(prompt).toContain("recoup-platform-email-helper");
  });

  it("embeds the artist_account_id so the agent can resolve the artist directly", () => {
    const prompt = buildFirstTaskPrompt(base);
    expect(prompt).toContain("artist-123");
  });

  it("carries the sandbox no-python reliability guardrail", () => {
    const prompt = buildFirstTaskPrompt(base);
    // the LA EQUIS lesson: the sandbox has no python; scripting must be node/jq
    expect(prompt.toLowerCase()).toContain("python");
  });

  it("forbids fabricating numbers", () => {
    const prompt = buildFirstTaskPrompt(base);
    expect(prompt.toLowerCase()).toContain("never fabricate");
  });

  it("mentions the catalog by name when one is provided", () => {
    const prompt = buildFirstTaskPrompt({
      ...base,
      catalogName: "Tyler's Catalog",
    });
    expect(prompt).toContain('"Tyler\'s Catalog"');
  });

  it("omits the catalog clause cleanly when no catalog name is provided", () => {
    const prompt = buildFirstTaskPrompt(base);
    expect(prompt).not.toContain('""');
    expect(prompt).not.toContain("undefined");
  });

  it("is identical for the pre-run and the scheduled task (pure)", () => {
    const input = { ...base, catalogName: "Debut" };
    expect(buildFirstTaskPrompt(input)).toBe(buildFirstTaskPrompt(input));
  });
});
