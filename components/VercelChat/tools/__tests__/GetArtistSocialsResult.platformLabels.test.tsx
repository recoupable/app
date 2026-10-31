// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import GetArtistSocialsResult from "../GetArtistSocialsResult";
import type { Social, SocialsResponse } from "@/types/Social";

const social: Social = {
  id: "synthetic-social",
  social_id: "synthetic-social",
  username: "synthetic_artist",
  avatar: null,
  profile_url: "instagram.com/synthetic_artist",
  region: null,
  bio: null,
  follower_count: null,
  following_count: null,
  updated_at: "2026-10-22T00:00:00Z",
};

afterEach(cleanup);

describe("Artist social result platform labels", () => {
  it.each([
    ["instagram.com/synthetic_artist", "Instagram", "@synthetic_artist"],
    ["INSTAGRAM.COM/synthetic_artist", "Instagram", "@synthetic_artist"],
    [
      "open.spotify.com/artist/synthetic",
      "Spotify",
      "open.spotify.com/artist/synthetic",
    ],
    [
      "music.apple.com/us/artist/synthetic/1",
      "Apple Music",
      "@synthetic_artist",
    ],
    ["youtu.be/synthetic", "YouTube", "@synthetic"],
    [
      "open.spotify.com/artist/synthetic?redirect=https://example.test",
      "Spotify",
      "open.spotify.com/artist/synthetic?redirect=https://example.test",
    ],
    ["box.com/synthetic_artist", "box", "@synthetic_artist"],
    [
      "example.test/instagram.com/synthetic_artist",
      "example",
      "@synthetic_artist",
    ],
    [
      "instagram.com.example.test/synthetic_artist",
      "instagram",
      "@synthetic_artist",
    ],
  ])(
    "labels %s from its host while preserving the supplied profile",
    (profileUrl, label, detail) => {
      const result: SocialsResponse = {
        status: "success",
        success: true,
        pagination: { page: 1, limit: 10, total_count: 1, total_pages: 1 },
        socials: [{ ...social, profile_url: profileUrl }],
      };
      render(
        <>
          <p>Here are the supplied artist profiles.</p>
          <GetArtistSocialsResult result={result} />
          <p>The conversation continues.</p>
        </>,
      );
      const link = screen.getByRole("link");
      expect(within(link).getByText(label, { exact: true })).toBeTruthy();
      expect(within(link).getByText(detail, { exact: true })).toBeTruthy();
      expect(link.getAttribute("href")).toBe(`https://${profileUrl}`);
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")?.split(" ")).toEqual(
        expect.arrayContaining(["noopener", "noreferrer"]),
      );
      expect(screen.getByText("Artist Socials Found")).toBeTruthy();
      expect(screen.getByText("1 platform")).toBeTruthy();
      expect(
        screen.getByText("Here are the supplied artist profiles."),
      ).toBeTruthy();
      expect(screen.getByText("The conversation continues.")).toBeTruthy();
    },
  );
});
