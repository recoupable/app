import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import AddArtistDialog from "../AddArtistDialog";
const fixture = vi.hoisted(() => ({
  busy: false,
  pending: false,
  retry: vi.fn(),
  close: vi.fn(),
}));
vi.mock("@/providers/OrganizationProvider", () => ({
  useOrganization: () => ({ selectedOrgId: "fixture-org" }),
}));
vi.mock("@/providers/UserProvder", () => ({
  useUserProvider: () => ({ userData: { account_id: "fixture-actor" } }),
}));
vi.mock("@/providers/ArtistProvider", () => ({
  useArtistProvider: () => ({
    isCreationOpen: true,
    closeCreation: fixture.close,
  }),
}));
vi.mock("@/hooks/useAccountOrganizations", () => ({
  default: () => ({
    data: undefined,
    isPending: fixture.pending,
    isError: !fixture.pending,
    isFetching: false,
    refetch: fixture.retry,
  }),
}));
vi.mock("@/hooks/useAddSpotifyArtist", () => ({
  useAddSpotifyArtist: () => ({ add: vi.fn(), isAdding: fixture.busy }),
}));
vi.mock("../SpotifyArtistSearch", () => ({
  default: () => <div>Spotify search fixture</div>,
}));
vi.mock("../ManualProfessionalForm", () => ({
  default: () => <div>Manual form fixture</div>,
}));
beforeEach(() => {
  fixture.busy = false;
  fixture.pending = false;
  fixture.retry.mockReset();
});
afterEach(cleanup);
it("exposes the selected mode and allows retrying organization lookup", async () => {
  render(<AddArtistDialog />);
  const spotify = screen.getByRole("button", { name: "Spotify artist" });
  const manual = screen.getByRole("button", { name: "Songwriter / producer" });
  expect(spotify.getAttribute("aria-pressed")).toBe("true");
  await userEvent.click(manual);
  expect(manual.getAttribute("aria-pressed")).toBe("true");
  expect(screen.getByRole("alert").textContent).toContain(
    "Could not confirm access",
  );
  await userEvent.click(
    screen.getByRole("button", { name: "Retry organization" }),
  );
  expect(fixture.retry).toHaveBeenCalledTimes(1);
});
it("announces organization loading", async () => {
  fixture.pending = true;
  render(<AddArtistDialog />);
  await userEvent.click(
    screen.getByRole("button", { name: "Songwriter / producer" }),
  );
  expect(screen.getByRole("status").textContent).toContain(
    "Loading organization",
  );
});
it("blocks mode switching while a Spotify add is in flight", () => {
  fixture.busy = true;
  render(<AddArtistDialog />);
  expect(
    screen
      .getByRole("button", { name: "Spotify artist" })
      .hasAttribute("disabled"),
  ).toBe(true);
  expect(
    screen
      .getByRole("button", { name: "Songwriter / producer" })
      .hasAttribute("disabled"),
  ).toBe(true);
});
