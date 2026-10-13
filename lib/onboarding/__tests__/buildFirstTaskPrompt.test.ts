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

// Social scraping joined the report (chat#2006): the homepage starter card
// and onboarding share this prompt, and the proven shape in prod (task
// 734ee2ee, three consecutive Monday sends) is Spotify + social.
describe("buildFirstTaskPrompt social section", () => {
  const prompt = buildFirstTaskPrompt(base);

  it("fires the artist-wide social scrape with a posts depth", () => {
    expect(prompt).toContain("POST /api/artist/socials/scrape");
    expect(prompt).toContain('"artist_account_id":"artist-123"');
    expect(prompt).toContain('"posts":12');
  });

  it("polls the Apify run with a hard time cap and never re-fires", () => {
    expect(prompt).toContain("GET /api/apify/runs/{runId}");
    expect(prompt).toMatch(/AT MOST 3 MINUTES/);
    expect(prompt.toLowerCase()).toContain("do not re-fire");
  });

  it("reads follower counts per platform from the artist's socials", () => {
    expect(prompt).toContain("GET /api/artists/artist-123/socials");
  });

  it("asks for the top posts by engagement with thumbnails", () => {
    expect(prompt).toMatch(/TOP 3 posts by engagement/i);
    expect(prompt.toLowerCase()).toContain("thumbnail");
  });

  it("states a missing platform in one line instead of printing zeros", () => {
    expect(prompt.toLowerCase()).toContain("not connected");
    expect(prompt.toLowerCase()).toContain(
      "never present a missing platform as a zero",
    );
  });
});

describe("buildFirstTaskPrompt email header", () => {
  const prompt = buildFirstTaskPrompt(base);

  it("renders the artist photo as a small thumbnail beside the title, not a full-width hero", () => {
    expect(prompt).toContain('width="72" height="72"');
    expect(prompt.toLowerCase()).toContain(
      "never render the artist photo full-width",
    );
    expect(prompt).not.toMatch(/full-width artist photo/i);
  });
});

describe("buildFirstTaskPrompt image and escaping rules", () => {
  const prompt = buildFirstTaskPrompt(base);

  it("scopes the Spotify-only image rule to Spotify artwork so social thumbnails are allowed", () => {
    expect(prompt).toContain("Spotify artwork");
    expect(prompt).not.toMatch(
      /All images must use https URLs from the Spotify API/,
    );
  });

  it("requires escaped captions and https-only social URLs in the email", () => {
    expect(prompt.toLowerCase()).toContain("html-escape");
    expect(prompt).toContain("https:");
  });

  it("never calls a removed Songstats-backed research endpoint (chat#1987)", () => {
    const prompt = buildFirstTaskPrompt(base);
    expect(prompt).not.toMatch(
      /research\/(metrics|insights|playlists|milestones|career|similar|audience|urls|lookup|profile|albums\b|tracks\?artist)/,
    );
    expect(prompt).not.toMatch(/Songstats/i);
  });

  it("sources context from the Spotify artist object and one web search", () => {
    const prompt = buildFirstTaskPrompt(base);
    expect(prompt).toContain("followers.total");
    expect(prompt).toContain("POST /api/research/web");
  });
});
