import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";
import { getChatScope } from "../getChatScope";
const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  select: vi.fn(),
  fetch: vi.fn(),
}));
vi.mock("@/lib/onboarding/server/getProfilePreferenceAccount", () => ({
  getProfilePreferenceAccount: mocks.auth,
}));
vi.mock("@/lib/supabase/sessions/selectWorkspaceSessionIds", () => ({
  selectWorkspaceSessionIds: mocks.select,
}));
const user = "11111111-1111-4111-8111-111111111111";
const org = "22222222-2222-4222-8222-222222222222";
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", mocks.fetch);
  mocks.auth.mockResolvedValue(user);
  mocks.select.mockResolvedValue(["session"]);
});
describe("workspace conversation access", () => {
  it("derives personal identity from authentication", async () => {
    const response = await getChatScope(
      new Request("https://app.test/api/chat-scope"),
    );
    expect(response.status).toBe(200);
    expect(mocks.select).toHaveBeenCalledWith(user, user);
  });
  it("rejects account overrides and malformed organization IDs", async () => {
    const response = await getChatScope(
      new Request("https://app.test/api/chat-scope?accountId=someone"),
    );
    expect(response.status).toBe(400);
    expect(mocks.select).not.toHaveBeenCalled();
  });
  it("does not query sessions for unauthenticated requests", async () => {
    mocks.auth.mockResolvedValue(NextResponse.json({}, { status: 401 }));
    expect(
      (await getChatScope(new Request("https://app.test/api/chat-scope")))
        .status,
    ).toBe(401);
    expect(mocks.select).not.toHaveBeenCalled();
  });
  it("rejects an organization outside the caller's memberships", async () => {
    mocks.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ organizations: [] }),
    });
    const response = await getChatScope(
      new Request(`https://app.test/api/chat-scope?organizationId=${org}`, {
        headers: { Authorization: "Bearer token" },
      }),
    );
    expect(response.status).toBe(403);
    expect(mocks.select).not.toHaveBeenCalled();
  });
  it("filters by both authenticated owner and authorized workspace", async () => {
    mocks.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ organizations: [{ organization_id: org }] }),
    });
    const response = await getChatScope(
      new Request(`https://app.test/api/chat-scope?organizationId=${org}`, {
        headers: { Authorization: "Bearer token" },
      }),
    );
    expect(response.status).toBe(200);
    expect(mocks.select).toHaveBeenCalledWith(user, org);
  });
});
