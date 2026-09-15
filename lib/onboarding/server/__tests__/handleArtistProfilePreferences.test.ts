import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";
import { handleArtistProfilePreferences } from "../handleArtistProfilePreferences";
import { getProfilePreferenceAccount } from "../getProfilePreferenceAccount";
import { selectArtistProfilePreferences } from "@/lib/supabase/account_artist_profile_preferences/selectArtistProfilePreferences";
import { setArtistProfilePreference } from "@/lib/supabase/account_artist_profile_preferences/setArtistProfilePreference";

vi.mock("../getProfilePreferenceAccount");
vi.mock(
  "@/lib/supabase/account_artist_profile_preferences/selectArtistProfilePreferences",
  () => ({ selectArtistProfilePreferences: vi.fn() }),
);
vi.mock(
  "@/lib/supabase/account_artist_profile_preferences/setArtistProfilePreference",
  () => ({ setArtistProfilePreference: vi.fn() }),
);
const accountId = "11111111-1111-4111-8111-111111111111";
const artistId = "22222222-2222-4222-8222-222222222222";
const fetchMock = vi.fn();
const request = (body: unknown) =>
  new Request("http://localhost/api/onboarding/artist-profiles", {
    method: "PATCH",
    headers: { Authorization: "Bearer test" },
    body: JSON.stringify(body),
  });
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal("fetch", fetchMock);
  vi.mocked(getProfilePreferenceAccount).mockResolvedValue(accountId);
  vi.mocked(selectArtistProfilePreferences).mockResolvedValue([]);
  vi.mocked(setArtistProfilePreference).mockResolvedValue();
  fetchMock.mockResolvedValue(Response.json({ status: "success" }));
});
describe("profile preference API", () => {
  it("rejects unauthenticated reads without querying preferences", async () => {
    vi.mocked(getProfilePreferenceAccount).mockResolvedValue(
      NextResponse.json({}, { status: 401 }),
    );
    expect(
      (await handleArtistProfilePreferences(new Request("http://localhost")))
        .status,
    ).toBe(401);
    expect(selectArtistProfilePreferences).not.toHaveBeenCalled();
  });
  it("reads only the verified account and disables caching", async () => {
    vi.mocked(selectArtistProfilePreferences).mockResolvedValue([artistId]);
    const res = await handleArtistProfilePreferences(
      new Request("http://localhost?accountId=other"),
    );
    expect(selectArtistProfilePreferences).toHaveBeenCalledWith(accountId);
    expect(await res.json()).toEqual({ accountId, artistIds: [artistId] });
    expect(res.headers.get("Cache-Control")).toContain("no-store");
  });
  it.each([true, false])(
    "persists or undoes the verified account's choice: %s",
    async (noProfile) => {
      expect(
        (await handleArtistProfilePreferences(request({ artistId, noProfile })))
          .status,
      ).toBe(200);
      expect(setArtistProfilePreference).toHaveBeenCalledWith(
        accountId,
        artistId,
        noProfile,
      );
    },
  );
  it.each([
    { artistId, noProfile: "yes" },
    { artistId: "invalid", noProfile: true },
    { artistId, noProfile: true, accountId: "other" },
  ])("rejects invalid input or an account override", async (body) => {
    expect((await handleArtistProfilePreferences(request(body))).status).toBe(
      400,
    );
    expect(setArtistProfilePreference).not.toHaveBeenCalled();
  });
  it("refuses to acknowledge an artist outside the caller's roster", async () => {
    fetchMock.mockResolvedValue(
      Response.json({ error: "Forbidden" }, { status: 403 }),
    );
    expect(
      (
        await handleArtistProfilePreferences(
          request({ artistId, noProfile: true }),
        )
      ).status,
    ).toBe(403);
    expect(setArtistProfilePreference).not.toHaveBeenCalled();
  });
  it("does not report a failed write as saved", async () => {
    vi.mocked(setArtistProfilePreference).mockRejectedValue(
      new Error("Database unavailable"),
    );
    expect(
      (
        await handleArtistProfilePreferences(
          request({ artistId, noProfile: true }),
        )
      ).status,
    ).toBe(503);
    expect(selectArtistProfilePreferences).not.toHaveBeenCalled();
  });
  it("does not turn a read failure into an empty preference list", async () => {
    vi.mocked(selectArtistProfilePreferences).mockRejectedValue(
      new Error("Database unavailable"),
    );
    expect(
      (await handleArtistProfilePreferences(new Request("http://localhost")))
        .status,
    ).toBe(503);
  });
});
