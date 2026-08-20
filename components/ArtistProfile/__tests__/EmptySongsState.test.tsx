// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import EmptySongsState from "@/components/ArtistProfile/EmptySongsState";

const ARTIST = "ec1443b3-6928-4eb9-955c-b426bae9e444";
const SPOTIFY_SOCIAL = {
  profile_url: "open.spotify.com/artist/6HhLzHoMHji3wtrHBFqXbz",
};

const state = vi.hoisted(() => ({
  authenticated: false,
  ready: true,
  artists: [] as { account_id: string }[],
  isLoading: true,
}));

vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({ authenticated: state.authenticated, ready: state.ready }),
}));
vi.mock("@/providers/ArtistProvider", () => ({
  useArtistProvider: () => ({
    artists: state.artists,
    isLoading: state.isLoading,
  }),
}));
vi.mock("@/components/Valuation/RunValuationButton", () => ({
  default: () => <button>Run valuation</button>,
}));

describe("EmptySongsState", () => {
  beforeEach(() => {
    state.authenticated = false;
    state.ready = true;
    state.artists = [];
    state.isLoading = true;
  });

  // The roster query is disabled while signed out, so its pending flag never
  // resolves — the guard must not swallow the funnel CTA for public viewers.
  it("shows the funnel CTA to a signed-out viewer despite the roster never loading", () => {
    render(<EmptySongsState artistId={ARTIST} socials={[SPOTIFY_SOCIAL]} />);

    expect(screen.getByText(/Get a free valuation/)).toBeDefined();
    expect(screen.queryByText("Run valuation")).toBeNull();
  });

  it("shows the run button to a signed-in viewer who rosters the artist", () => {
    state.authenticated = true;
    state.isLoading = false;
    state.artists = [{ account_id: ARTIST }];

    render(<EmptySongsState artistId={ARTIST} socials={[SPOTIFY_SOCIAL]} />);

    expect(screen.getByText("Run valuation")).toBeDefined();
    expect(screen.queryByText(/Get a free valuation/)).toBeNull();
  });

  it("decides nothing while a signed-in viewer's roster is still loading", () => {
    state.authenticated = true;
    state.isLoading = true;

    render(<EmptySongsState artistId={ARTIST} socials={[SPOTIFY_SOCIAL]} />);

    expect(screen.queryByText("Run valuation")).toBeNull();
    expect(screen.queryByText(/Get a free valuation/)).toBeNull();
  });

  it("shows the funnel CTA to a signed-in viewer who does not roster the artist", () => {
    state.authenticated = true;
    state.isLoading = false;
    state.artists = [{ account_id: "someone-else" }];

    render(<EmptySongsState artistId={ARTIST} socials={[SPOTIFY_SOCIAL]} />);

    expect(screen.getByText(/Get a free valuation/)).toBeDefined();
  });
});
