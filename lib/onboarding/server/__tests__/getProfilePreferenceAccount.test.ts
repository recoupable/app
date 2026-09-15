import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";
import { getProfilePreferenceAccount } from "../getProfilePreferenceAccount";
const fetchMock = vi.fn();
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal("fetch", fetchMock);
});
describe("profile preference authentication", () => {
  it("requires a bearer token", async () => {
    expect(
      (
        (await getProfilePreferenceAccount(
          new Request("http://localhost"),
        )) as NextResponse
      ).status,
    ).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("uses the API verified identity, never a client-provided account ID", async () => {
    const accountId = "11111111-1111-4111-8111-111111111111";
    fetchMock.mockResolvedValue(Response.json({ accountId }));
    expect(
      await getProfilePreferenceAccount(
        new Request("http://localhost?accountId=other", {
          headers: { Authorization: "Bearer test" },
        }),
      ),
    ).toBe(accountId);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://test-recoup-api.vercel.app/api/accounts/id",
      { headers: { Authorization: "Bearer test" }, cache: "no-store" },
    );
  });
  it("does not trust a rejected token", async () => {
    fetchMock.mockResolvedValue(Response.json({}, { status: 401 }));
    expect(
      (
        (await getProfilePreferenceAccount(
          new Request("http://localhost", {
            headers: { Authorization: "Bearer bad" },
          }),
        )) as NextResponse
      ).status,
    ).toBe(401);
  });
});
