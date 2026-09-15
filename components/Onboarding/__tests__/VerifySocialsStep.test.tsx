// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import VerifySocialsStep from "../VerifySocialsStep";
import { getOnboardingStep } from "@/lib/onboarding/getOnboardingStep";
import type { ArtistRecord } from "@/types/Artist";

const state = vi.hoisted(() => ({
  artists: [] as ArtistRecord[],
  selectedArtist: null as ArtistRecord | null,
  replace: vi.fn(),
  isLoading: false,
  isError: false,
  fixingArtistId: null as string | null,
  getArtists: vi.fn(),
  dismissed: [] as string[],
  preferenceError: false,
  preferencePending: false,
  setNoProfile: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: state.replace }),
}));
vi.mock("@/hooks/onboarding/useArtistProfilePreferences", () => ({
  useArtistProfilePreferences: () => ({
    artistIds: state.dismissed,
    isSuccess: !state.preferenceError && !state.preferencePending,
    isError: state.preferenceError,
    isPending: state.preferencePending,
    isSaving: false,
    setNoProfile: state.setNoProfile,
    refetch: vi.fn(),
  }),
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
vi.mock("../SocialSearchOrPaste", () => ({
  default: () => <input aria-label="Search Spotify for an artist" />,
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
  state.selectedArtist = null;
  state.replace.mockReset();
  state.dismissed = [];
  state.preferenceError = false;
  state.preferencePending = false;
  state.setNoProfile.mockReset().mockResolvedValue([]);
  state.isLoading = false;
  state.isError = false;
  state.fixingArtistId = null;
});

describe("missing artist profiles", () => {
  it("leaves setup when the selected artist is connected, even with missing roster profiles", () => {
    state.selectedArtist = artist("Connected artist", false);
    render(<VerifySocialsStep onConfirmed={vi.fn()} />);
    expect(state.replace).toHaveBeenCalledWith("/");
    expect(screen.queryByText("Missing profiles")).toBeNull();
  });
  it("shows only the selected missing artist and reacts when selection changes", () => {
    state.selectedArtist = artist("Missing artist", false);
    state.artists.push(artist("Other missing artist", false));
    const view = render(<VerifySocialsStep onConfirmed={vi.fn()} />);
    expect(screen.getByText("Missing artist")).toBeDefined();
    expect(screen.queryByText("Other missing artist")).toBeNull();
    state.selectedArtist = artist("Connected artist", true);
    view.rerender(<VerifySocialsStep onConfirmed={vi.fn()} />);
    expect(state.replace).toHaveBeenCalledWith("/");
  });
  it("does not redirect while profile data is unresolved", () => {
    state.selectedArtist = artist("Connected artist", true);
    state.isLoading = true;
    render(<VerifySocialsStep onConfirmed={vi.fn()} />);
    expect(state.replace).not.toHaveBeenCalled();
  });
  it("waits for server confirmation, remembers no-profile choices, and supports undo", async () => {
    const onConfirmed = vi.fn();
    const view = render(<VerifySocialsStep onConfirmed={onConfirmed} />);
    fireEvent.click(
      screen.getByRole("button", { name: "No profile yet for Missing artist" }),
    );
    expect(state.setNoProfile).toHaveBeenCalledWith("Missing artist", true);
    expect(
      (
        screen.getByRole("button", {
          name: "Continue setup",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    state.dismissed = ["Missing artist"];
    view.rerender(<VerifySocialsStep onConfirmed={onConfirmed} />);
    expect(screen.getByText(/All artists reviewed/)).toBeDefined();
    expect(
      (
        screen.getByRole("button", {
          name: "Continue setup",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(false);
    fireEvent.click(screen.getByText("No profile yet (1)"));
    fireEvent.click(
      screen.getByRole("button", {
        name: "Undo no profile for Missing artist",
      }),
    );
    expect(state.setNoProfile).toHaveBeenCalledWith("Missing artist", false);
    state.dismissed = [];
    view.rerender(<VerifySocialsStep onConfirmed={onConfirmed} />);
    expect(
      screen.getByRole("heading", { name: "Missing artist" }),
    ).toBeDefined();
  });
  it("does not enable completion if saved choices cannot be loaded", () => {
    state.artists = [artist("Connected", true)];
    state.preferenceError = true;
    render(<VerifySocialsStep onConfirmed={vi.fn()} />);
    expect(screen.getByRole("alert")).toBeDefined();
    expect(
      (
        screen.getByRole("button", {
          name: "Continue setup",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
  });
  it("opens one editor at a time and advances when its artist is connected", () => {
    state.artists = [artist("First", false), artist("Second", false)];
    const view = render(<VerifySocialsStep onConfirmed={vi.fn()} />);
    expect(screen.getAllByRole("textbox")).toHaveLength(1);
    expect(
      screen
        .getByRole("button", { name: "Close First" })
        .getAttribute("aria-expanded"),
    ).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Connect Second" }));
    expect(screen.getAllByRole("textbox")).toHaveLength(1);
    expect(
      screen
        .getByRole("button", { name: "Connect First" })
        .getAttribute("aria-expanded"),
    ).toBe("false");
    state.artists = [artist("First", false), artist("Second", true)];
    view.rerender(<VerifySocialsStep onConfirmed={vi.fn()} />);
    expect(screen.queryByRole("heading", { name: "Second" })).toBeNull();
    expect(
      screen
        .getByRole("button", { name: "Close First" })
        .getAttribute("aria-expanded"),
    ).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Close First" }));
    expect(screen.queryByRole("textbox")).toBeNull();
  });
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
    expect(screen.getByText(/1 artist is missing a profile/)).toBeDefined();
    expect(screen.getByRole("button", { name: "Skip for now" })).toBeDefined();
  });
  it("cannot confirm missing data; a refreshed saved profile clears the list and gate", () => {
    const onConfirmed = vi.fn();
    const view = render(<VerifySocialsStep onConfirmed={onConfirmed} />);
    fireEvent.click(
      screen.getByRole("button", {
        name: "Continue setup",
      }),
    );
    expect(onConfirmed).not.toHaveBeenCalled();
    state.artists = state.artists.map((a) => artist(a.name!, true));
    view.rerender(<VerifySocialsStep onConfirmed={onConfirmed} />);
    expect(
      screen.queryByRole("heading", { name: "Missing artist" }),
    ).toBeNull();
    expect(screen.getByText(/All artists reviewed/)).toBeDefined();
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
