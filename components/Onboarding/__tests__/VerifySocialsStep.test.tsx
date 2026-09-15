// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import VerifySocialsStep from "../VerifySocialsStep";
import { getOnboardingStep } from "@/lib/onboarding/getOnboardingStep";
import type { ArtistRecord } from "@/types/Artist";

const state = vi.hoisted(() => ({
  artists: [] as ArtistRecord[],
  isLoading: false,
  isError: false,
  fixingArtistId: null as string | null,
  getArtists: vi.fn(),
}));
vi.mock("@/providers/ArtistProvider", () => ({
  useArtistProvider: () => ({
    ...state,
    // A stale selected-artist snapshot must not change which artists need work.
    sorted: [
      { account_id: "stale", name: "Stale artist", account_socials: [] },
    ],
  }),
}));
vi.mock("@/hooks/onboarding/useSocialFix", () => ({
  useSocialFix: () => ({
    fixSocial: vi.fn(),
    fixingArtistId: state.fixingArtistId,
  }),
}));
vi.mock("@/hooks/onboarding/useSocialRemove", () => ({
  useSocialRemove: () => ({ removeSocial: vi.fn(), removingSocialId: null }),
}));
vi.mock("../SetupSkipLink", () => ({
  default: () => <button>Skip for now</button>,
}));
vi.mock("../ArtistSocialsCard", () => ({
  default: ({ artist }: { artist: ArtistRecord }) => <h2>{artist.name}</h2>,
}));
const artist = (id: string, linked: boolean) =>
  ({
    account_id: id,
    name: id,
    account_socials: linked ? [{ id: `social-${id}` }] : [],
  }) as unknown as ArtistRecord;

afterEach(cleanup);
beforeEach(() => {
  state.artists = [
    artist("Connected artist", true),
    artist("Missing artist", false),
  ];
  state.isLoading = false;
  state.isError = false;
  state.fixingArtistId = null;
});

describe("missing artist profiles", () => {
  it("shows only artists responsible for the socials gate and explains the action", () => {
    expect(
      getOnboardingStep({ artists: state.artists, catalogs: [], tasks: [] }),
    ).toBe("socials");
    render(<VerifySocialsStep onConfirmed={vi.fn()} />);
    expect(
      screen.queryByRole("heading", { name: "Connected artist" }),
    ).toBeNull();
    expect(screen.queryByRole("heading", { name: "Stale artist" })).toBeNull();
    expect(
      screen.getByRole("heading", { name: "Missing artist" }),
    ).toBeDefined();
    expect(
      screen.getByText(/You’re here because 1 artist is missing/),
    ).toBeDefined();
    expect(screen.getByRole("button", { name: "Skip for now" })).toBeDefined();
  });
  it("cannot confirm missing data; a refreshed saved profile clears the list and gate", () => {
    const onConfirmed = vi.fn();
    const view = render(<VerifySocialsStep onConfirmed={onConfirmed} />);
    fireEvent.click(
      screen.getByRole("button", {
        name: "Connect the missing profiles to continue",
      }),
    );
    expect(onConfirmed).not.toHaveBeenCalled();
    state.artists = state.artists.map((a) => artist(a.name!, true));
    view.rerender(<VerifySocialsStep onConfirmed={onConfirmed} />);
    expect(
      screen.queryByRole("heading", { name: "Missing artist" }),
    ).toBeNull();
    expect(screen.getByText(/This step is complete/)).toBeDefined();
    expect(
      getOnboardingStep({ artists: state.artists, catalogs: [], tasks: [] }),
    ).toBe("catalog");
    fireEvent.click(screen.getByRole("button", { name: "Continue setup" }));
    expect(onConfirmed).toHaveBeenCalledOnce();
  });
  it.each(["loading", "error", "empty", "saving"])(
    "does not mark %s data complete",
    (condition) => {
      state.artists = condition === "empty" ? [] : [artist("Connected", true)];
      state.isLoading = condition === "loading";
      state.isError = condition === "error";
      state.fixingArtistId = condition === "saving" ? "Connected" : null;
      const onConfirmed = vi.fn();
      render(<VerifySocialsStep onConfirmed={onConfirmed} />);
      const button = screen.getByRole("button", {
        name: condition === "saving" ? "Saving profile…" : "Continue setup",
      }) as HTMLButtonElement;
      expect(button.disabled).toBe(true);
      fireEvent.click(button);
      expect(onConfirmed).not.toHaveBeenCalled();
    },
  );
});
