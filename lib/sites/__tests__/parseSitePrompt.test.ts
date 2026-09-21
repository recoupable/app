import { expect, it } from "vitest";
import { parseSitePrompt } from "../parseSitePrompt";
it("accepts a link alone for an automatic concept", () => {
  expect(parseSitePrompt("https://open.spotify.com/track/abc")).toEqual({
    releaseUrl: "https://open.spotify.com/track/abc",
    brief: "",
  });
});
it("separates the idea from a shared localized Spotify link", () => {
  expect(
    parseSitePrompt(
      "Make a maze game https://open.spotify.com/intl-en/album/abc?si=123.",
    ),
  ).toEqual({
    releaseUrl: "https://open.spotify.com/intl-en/album/abc?si=123",
    brief: "Make a maze game",
  });
});
it("asks for a link without sending a request", () => {
  expect(() => parseSitePrompt("Make a game")).toThrow("Add a Spotify");
  expect(() =>
    parseSitePrompt("https://open.spotify.com.evil.test/track/abc"),
  ).toThrow();
});
it("rejects multiple releases and overly long briefs", () => {
  expect(() =>
    parseSitePrompt(
      "https://open.spotify.com/track/a https://open.spotify.com/track/b",
    ),
  ).toThrow("one Spotify");
  expect(() =>
    parseSitePrompt("x".repeat(6001) + " https://open.spotify.com/track/a"),
  ).toThrow("6,000");
});
