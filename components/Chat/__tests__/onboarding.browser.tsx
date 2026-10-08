import React, { useContext, useState } from "react";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import WorkspaceContextBar from "../WorkspaceContextBar";
import ArtistSettingModal from "@/components/ArtistSettingModal";
import AddToOrgButton from "@/components/ArtistSetting/AddToOrgButton";
import {
  ArtistFixtureContext,
  OrganizationFixtureContext,
} from "./onboardingFixtureContexts";
import type { ArtistRecord } from "@/types/Artist";
import "@/app/globals.css";

// Signed-in fixture context. The real controls, dialog, menu, hook and HTTP
// request builder run here; provider auth and network responses are fixtures.
const fixture = vi.hoisted(() => ({
  fetch: vi.fn(),
}));
vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({
    authenticated: true,
    getAccessToken: async () => "fixture-token",
  }),
}));
vi.mock("@/providers/ArtistProvider", () => ({
  useArtistProvider: () => useContext(ArtistFixtureContext),
}));
vi.mock("@/providers/OrganizationProvider", () => ({
  useOrganization: () => useContext(OrganizationFixtureContext),
}));
vi.mock("@/hooks/useAccountOrganizations", () => ({
  default: () => ({
    data: [{ organization_id: "label-1", organization_name: "Fixture Label" }],
    isPending: false,
    isError: false,
  }),
}));
vi.mock("@/lib/api/getClientApiBaseUrl", () => ({
  getClientApiBaseUrl: () => "http://fixture.invalid",
}));
vi.mock("@/components/ArtistSetting/Settings", () => ({
  default: function SettingsFixture() {
    const { editableArtist } = useContext(ArtistFixtureContext);
    return (
      <AddToOrgButton artistId={(editableArtist as ArtistRecord).account_id} />
    );
  },
}));
const artists = [
  { account_id: "artist-a", name: "Artist A" },
  { account_id: "artist-b", name: "Artist B" },
] as ArtistRecord[];
let client: QueryClient;
function Harness() {
  const [selectedArtist, setSelectedArtist] = useState<ArtistRecord | null>(
    artists[0],
  );
  const [editableArtist, toggleUpdate] = useState<ArtistRecord | null>(null);
  const [isOpenSettingModal, setIsOpenSettingModal] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const artistContext = {
    selectedArtist,
    setSelectedArtist,
    editableArtist,
    toggleUpdate,
    isOpenSettingModal,
    setIsOpenSettingModal,
    artists,
    isLoading: false,
    isError: false,
    toggleCreation: vi.fn(),
  };
  const orgContext = {
    selectedOrgId,
    setSelectedOrgId,
    isInitialized: true,
    openCreateOrg: vi.fn(),
  };
  return (
    <QueryClientProvider client={client}>
      <ArtistFixtureContext.Provider value={artistContext}>
        <OrganizationFixtureContext.Provider value={orgContext}>
          <WorkspaceContextBar />
          <ArtistSettingModal />
        </OrganizationFixtureContext.Provider>
      </ArtistFixtureContext.Provider>
    </QueryClientProvider>
  );
}
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
beforeEach(() => {
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  fixture.fetch.mockReset();
  vi.stubGlobal("fetch", fixture.fetch);
});

async function openSettings(name = "Artist A") {
  const trigger = await screen.findByRole("button", {
    name: `Artist settings for ${name}`,
  });
  trigger.focus();
  await userEvent.keyboard("{Enter}");
  await waitFor(() =>
    expect(screen.getByRole("dialog").textContent).toContain(name),
  );
  return trigger;
}
async function chooseOrganization() {
  await userEvent.click(
    screen.getByRole("button", { name: "Add to Organization" }),
  );
  await userEvent.keyboard("{ArrowDown}{Enter}");
}

describe("artist settings onboarding", () => {
  it.each([
    [1280, 900],
    [390, 844],
  ])("opens, links and restores focus at %sx%s", async (width, height) => {
    await page.viewport(width, height);
    fixture.fetch.mockResolvedValue(
      new Response(JSON.stringify({ status: "success", id: "relationship" }), {
        status: 200,
      }),
    );
    const invalidate = vi.spyOn(client, "invalidateQueries");
    render(<Harness />);
    const trigger = await openSettings();
    expect(trigger.getBoundingClientRect().width).toBeGreaterThanOrEqual(44);
    expect(trigger.getBoundingClientRect().right).toBeLessThanOrEqual(width);
    await chooseOrganization();
    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toContain("Fixture Label"),
    );
    const [url, request] = fixture.fetch.mock.calls[0];
    expect(url).toContain("/api/organizations/artists");
    expect(JSON.parse(request.body)).toEqual({
      artistId: "artist-a",
      organizationId: "label-1",
    });
    expect(request.headers.Authorization).toBe("Bearer fixture-token");
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["artists"] });
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(document.activeElement).toBe(trigger));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("keeps a denied action visible and retryable", async () => {
    fixture.fetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Access denied" }), { status: 403 }),
    );
    render(<Harness />);
    await openSettings();
    await chooseOrganization();
    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toBe("Access denied"),
    );
    fixture.fetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ status: "success", id: "relationship" }), {
        status: 200,
      }),
    );
    await chooseOrganization();
    await waitFor(() => expect(screen.getByRole("status")).toBeDefined());
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("uses the selected identity after artist and workspace switching", async () => {
    render(<Harness />);
    await userEvent.click(
      screen.getByRole("button", { name: "Artist: Artist A" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Artist B" }));
    await openSettings("Artist B");
    await userEvent.keyboard("{Escape}");
    await userEvent.click(
      await screen.findByRole("button", { name: "Workspace: Personal" }),
    );
    await userEvent.click(
      await screen.findByRole("menuitem", { name: "Fixture Label" }),
    );
    await openSettings("Artist B");
    expect(screen.getByRole("dialog").textContent).toContain("Artist B");
    expect(
      (
        screen.getByRole("button", {
          name: "Add to Organization",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    expect(fixture.fetch).not.toHaveBeenCalled();
  });
});
