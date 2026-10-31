// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getSocialProfileHref } from "@/lib/socials/getSocialProfileHref";
import GetArtistSocialsResult from "../GetArtistSocialsResult";
import UpdateArtistSocialsSuccess from "../UpdateArtistSocialsSuccess";
import type { Social, SocialsResponse } from "@/types/Social";
import type { AccountSocialWithSocial } from "@/lib/supabase/account_socials/getAccountSocials";

const actor = vi.hoisted(() => ({ getArtists: vi.fn() }));
vi.mock("@/providers/ArtistProvider", () => ({
  useArtistProvider: () => ({
    getArtists: actor.getArtists,
    selectedArtist: {
      name: "Synthetic artist",
      image: null,
      label: null,
      updated_at: null,
    },
  }),
}));

const cases = [
  ["instagram.com/synthetic_artist", "https://instagram.com/synthetic_artist"],
  [
    "https://instagram.com/synthetic_artist?si=a%2Bb#bio",
    "https://instagram.com/synthetic_artist?si=a%2Bb#bio",
  ],
  [
    "http://instagram.com/synthetic_artist",
    "http://instagram.com/synthetic_artist",
  ],
  [
    "HTTPS://instagram.com/synthetic_artist",
    "HTTPS://instagram.com/synthetic_artist",
  ],
  [
    "HTTP://instagram.com/synthetic_artist",
    "HTTP://instagram.com/synthetic_artist",
  ],
  [
    "instagram.com/synthetic_artist?next=https://example.test",
    "https://instagram.com/synthetic_artist?next=https://example.test",
  ],
  [
    "https://instagram.com:8443/synthetic_artist?x=one%20two#bio",
    "https://instagram.com:8443/synthetic_artist?x=one%20two#bio",
  ],
  [
    " instagram.com/synthetic_artist ",
    "https://instagram.com/synthetic_artist",
  ],
  [
    " https://instagram.com/synthetic_artist ",
    "https://instagram.com/synthetic_artist",
  ],
  [
    "https://instagram.com/synthetic_artist?from=http://example.test#https://example.test",
    "https://instagram.com/synthetic_artist?from=http://example.test#https://example.test",
  ],
] as const;

function renderProfiles(surface: "found" | "updated", profileUrl: string) {
  const social: Social = {
    id: "synthetic-social",
    social_id: "synthetic-social",
    username: "synthetic_artist",
    avatar: null,
    profile_url: profileUrl,
    region: null,
    bio: null,
    follower_count: null,
    following_count: null,
    updated_at: "2026-10-22T00:00:00Z",
  };
  const found: SocialsResponse = {
    status: "success",
    success: true,
    socials: [social],
    pagination: { page: 1, limit: 10, total_count: 1, total_pages: 1 },
  };
  const { social_id, follower_count, following_count, ...databaseSocial } =
    social;
  const joined: AccountSocialWithSocial = {
    id: "synthetic-join",
    account_id: "synthetic-artist",
    social_id,
    social: {
      ...databaseSocial,
      followerCount: follower_count,
      followingCount: following_count,
    },
  };
  return render(
    <>
      <p>Here are the supplied profiles.</p>
      {surface === "found" ? (
        <GetArtistSocialsResult result={found} />
      ) : (
        <UpdateArtistSocialsSuccess
          result={{
            success: true,
            message: "Supplied profiles updated.",
            socials: [joined],
          }}
        />
      )}
      <p>The conversation continues.</p>
    </>,
  );
}

afterEach(cleanup);
beforeEach(() => {
  actor.getArtists.mockReset();
  actor.getArtists.mockResolvedValue(undefined);
});

describe.each(["found", "updated"] as const)(
  "%s social profile destinations",
  (surface) => {
    it.each(cases)(
      "uses one protocol for %s while preserving profile content",
      (profileUrl, expected) => {
        renderProfiles(surface, profileUrl);
        const link = screen.getByRole("link");
        expect(link.getAttribute("href")).toBe(expected);
        expect(
          new URL(link.getAttribute("href")!, "https://app.recoupable.dev/chat")
            .href,
        ).toBe(new URL(expected).href);
        expect(link.getAttribute("target")).toBe("_blank");
        expect(link.getAttribute("rel")?.split(" ")).toEqual(
          expect.arrayContaining(["noopener", "noreferrer"]),
        );
        if (surface === "found") {
          expect(screen.getByText("Instagram", { exact: true })).toBeTruthy();
          expect(screen.getByText("@synthetic_artist")).toBeTruthy();
          expect(screen.getByText("1 platform")).toBeTruthy();
        } else {
          expect(link.textContent).toContain(profileUrl);
          expect(screen.getByText("Synthetic artist")).toBeTruthy();
          expect(screen.getByText("Supplied profiles updated.")).toBeTruthy();
        }
        expect(actor.getArtists).toHaveBeenCalledTimes(
          surface === "updated" ? 1 : 0,
        );
        expect(
          screen.getByText("Here are the supplied profiles."),
        ).toBeTruthy();
        expect(screen.getByText("The conversation continues.")).toBeTruthy();
      },
    );
  },
);

describe("shared social profile href normalization", () => {
  it.each(cases)(
    "normalizes %s consistently for both producers",
    (profileUrl, expected) => {
      expect(getSocialProfileHref(profileUrl)).toBe(expected);
    },
  );
});
