import React, { useContext, useState } from "react";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import WorkspaceContextBar from "../WorkspaceContextBar";
import ArtistSettingModal from "@/components/ArtistSettingModal";
import Header from "@/components/Header/Header";
import { SETTING_MODE } from "@/types/Setting";
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
    data: [
      { organization_id: "label-1", organization_name: "Fixture Label" },
      { organization_id: "label-2", organization_name: "Other Label" },
    ],
    isPending: false,
    isError: false,
  }),
}));
vi.mock("@/lib/api/getClientApiBaseUrl", () => ({
  getClientApiBaseUrl: () => "http://fixture.invalid",
}));
vi.mock("@/components/ArtistSetting/DeleteModal", () => ({
  default: () => null,
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/",
}));
vi.mock("@/components/SideMenu", () => ({ default: () => null }));
vi.mock("@/components/Logo", () => ({ default: () => null }));
vi.mock("@/components/ImageWithFallback", () => ({ default: () => null }));
vi.mock("@/components/ArtistSetting/ImageSelect", () => ({
  default: () => null,
}));
vi.mock("@/components/ArtistSetting/Inputs", () => ({ default: () => null }));
vi.mock("@/components/ArtistSetting/KnowledgeSelect", () => ({
  default: () => null,
}));
vi.mock("@/components/ArtistSetting/Knowledges", () => ({
  default: () => null,
}));
vi.mock("@/components/ArtistSetting/TabbedSettings", () => ({
  TabbedSettings: ({
    header,
    generalContent,
  }: {
    header: React.ReactNode;
    generalContent: React.ReactNode;
  }) => (
    <>
      {header}
      {generalContent}
    </>
  ),
}));
const artists = [
  { account_id: "artist-a", name: "Artist A" },
  { account_id: "artist-b", name: "Artist B" },
] as ArtistRecord[];
let client: QueryClient;
function Harness({
  mobileHeader = false,
  workspace,
  initialized = true,
}: {
  mobileHeader?: boolean;
  workspace?: string | null;
  initialized?: boolean;
}) {
  const [selectedArtist, setSelectedArtist] = useState<ArtistRecord | null>(
    artists[0],
  );
  const [editableArtist, toggleUpdate] = useState<ArtistRecord | null>(null);
  const [isOpenSettingModal, setIsOpenSettingModal] = useState(false);
  const [chosenOrgId, setSelectedOrgId] = useState<string | null>(null);
  const selectedOrgId = workspace === undefined ? chosenOrgId : workspace;
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
    toggleSettingModal: () => setIsOpenSettingModal((open) => !open),
    sorted: artists,
    settingMode: SETTING_MODE.UPDATE,
    saveSetting: vi.fn(),
    updating: false,
    knowledgeUploading: false,
  };
  const orgContext = {
    selectedOrgId,
    setSelectedOrgId,
    isInitialized: initialized,
    openCreateOrg: vi.fn(),
  };
  return (
    <QueryClientProvider client={client}>
      <ArtistFixtureContext.Provider value={artistContext}>
        <OrganizationFixtureContext.Provider value={orgContext}>
          {mobileHeader ? <Header /> : <WorkspaceContextBar />}
          <ArtistSettingModal />
        </OrganizationFixtureContext.Provider>
      </ArtistFixtureContext.Provider>
    </QueryClientProvider>
  );
}
afterEach(async () => {
  if (screen.queryByRole("menu")) await userEvent.keyboard("{Escape}");
  if (screen.queryByRole("dialog")) {
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  }
  await waitFor(() =>
    expect(document.body.style.pointerEvents).not.toBe("none"),
  );
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
  await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
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
    render(<Harness mobileHeader={width === 390} />);
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
    await waitFor(() =>
      expect(document.body.style.pointerEvents).not.toBe("none"),
    );
    await openSettings("Artist B");
    expect(screen.getByRole("dialog").textContent).toContain("Artist B");
    fixture.fetch.mockResolvedValue(
      new Response(JSON.stringify({ status: "success", id: "relationship" }), {
        status: 200,
      }),
    );
    await chooseOrganization();
    await waitFor(() => expect(fixture.fetch).toHaveBeenCalledTimes(1));
    expect(JSON.parse(fixture.fetch.mock.calls[0][1].body)).toEqual({
      artistId: "artist-b",
      organizationId: "label-2",
    });
  });

  it("shows retry copy when a gateway returns HTML", async () => {
    fixture.fetch.mockResolvedValue(
      new Response("<html>Gateway error</html>", { status: 502 }),
    );
    render(<Harness />);
    await openSettings();
    await chooseOrganization();
    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toBe(
        "Could not add artist. Please retry.",
      ),
    );
  });

  it("returns focus to a pointer-activated mobile avatar", async () => {
    await page.viewport(390, 844);
    render(<Harness mobileHeader />);
    const trigger = await screen.findByRole("button", {
      name: "Artist settings for Artist A",
    });
    trigger.addEventListener("mousedown", (event) => event.preventDefault(), {
      once: true,
    });
    trigger.blur();
    await userEvent.click(trigger);
    await waitFor(() => expect(screen.getByRole("dialog")).toBeDefined());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });
  it("keeps settings open during workspace hydration and closes on a later switch", async () => {
    await page.viewport(1280, 900);
    const view = render(<Harness initialized={false} />);
    await openSettings();
    view.rerender(<Harness initialized workspace="label-1" />);
    await waitFor(() => expect(screen.getByRole("dialog")).toBeDefined());
    view.rerender(<Harness initialized workspace="label-2" />);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });
});
