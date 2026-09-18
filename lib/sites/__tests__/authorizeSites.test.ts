import { afterEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";
vi.mock("@/lib/onboarding/server/getProfilePreferenceAccount", () => ({
  getProfilePreferenceAccount: vi.fn(),
}));
import { getProfilePreferenceAccount } from "@/lib/onboarding/server/getProfilePreferenceAccount";
import { authorizeSites } from "../authorizeSites";
const account = "11111111-1111-4111-8111-111111111111";
const org = "22222222-2222-4222-8222-222222222222";
const req = new Request("https://example.com/api/sites", {
  headers: { Authorization: "Bearer test" },
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
describe("workspace authorization", () => {
  it("uses the verified account for personal sites", async () => {
    vi.mocked(getProfilePreferenceAccount).mockResolvedValue(account);
    expect(await authorizeSites(req)).toEqual({
      accountId: account,
      ownerId: account,
    });
  });
  it("rejects unauthenticated calls before membership lookup", async () => {
    vi.mocked(getProfilePreferenceAccount).mockResolvedValue(
      NextResponse.json({}, { status: 401 }),
    );
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    expect(((await authorizeSites(req, org)) as NextResponse).status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("rejects a workspace absent from memberships", async () => {
    vi.mocked(getProfilePreferenceAccount).mockResolvedValue(account);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({ organizations: [] })),
    );
    expect(((await authorizeSites(req, org)) as NextResponse).status).toBe(403);
  });
  it("accepts a verified workspace membership", async () => {
    vi.mocked(getProfilePreferenceAccount).mockResolvedValue(account);
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          Response.json({ organizations: [{ organization_id: org }] }),
        ),
    );
    expect(await authorizeSites(req, org)).toEqual({
      accountId: account,
      ownerId: org,
    });
  });
});
