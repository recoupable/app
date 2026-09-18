import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";
const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  select: vi.fn(),
  update: vi.fn(),
  generate: vi.fn(),
  signups: vi.fn(),
  insert: vi.fn(),
  list: vi.fn(),
}));
vi.mock("@/lib/sites/authorizeSites", () => ({ authorizeSites: mocks.auth }));
vi.mock("@/lib/supabase/sites/selectSite", () => ({
  selectSite: mocks.select,
}));
vi.mock("@/lib/supabase/sites/updateSite", () => ({
  updateSite: mocks.update,
}));
vi.mock("@/lib/supabase/sites/selectSignups", () => ({
  selectSignups: mocks.signups,
}));
vi.mock("@/lib/supabase/sites/insertSite", () => ({
  insertSite: mocks.insert,
}));
vi.mock("@/lib/supabase/sites/selectSites", () => ({
  selectSites: mocks.list,
}));
vi.mock("@/lib/sites/generateSite", () => ({ generateSite: mocks.generate }));
import { GET, PATCH } from "@/app/api/sites/[id]/route";
import { POST } from "@/app/api/sites/route";
const id = "11111111-1111-4111-8111-111111111111",
  owner = "22222222-2222-4222-8222-222222222222";
const context = { params: Promise.resolve({ id }) };
const draft = { name: "Release", design: { headline: "New draft" } };
const site = {
  id,
  owner_id: owner,
  revision: 3,
  draft,
  published: { name: "Old release" },
};
const patch = (body: unknown) =>
  new Request(`http://localhost/api/sites/${id}`, {
    method: "PATCH",
    headers: { Authorization: "Bearer token" },
    body: JSON.stringify(body),
  });
beforeEach(() => {
  vi.resetAllMocks();
  mocks.auth.mockResolvedValue({ accountId: owner, ownerId: owner });
  mocks.select.mockResolvedValue(site);
  mocks.signups.mockResolvedValue([]);
  mocks.update.mockResolvedValue({ ...site, revision: 4 });
});
describe("site actions", () => {
  it("rejects unauthenticated reads before looking up site data", async () => {
    mocks.auth.mockResolvedValue(
      NextResponse.json({ error: "Sign in" }, { status: 401 }),
    );
    expect((await GET(new Request("http://localhost"), context)).status).toBe(
      401,
    );
    expect(mocks.select).not.toHaveBeenCalled();
  });
  it("checks organization membership before returning site or fan data", async () => {
    mocks.auth
      .mockResolvedValueOnce({ accountId: "other", ownerId: "other" })
      .mockResolvedValueOnce(
        NextResponse.json({ error: "Denied" }, { status: 403 }),
      );
    expect((await GET(new Request("http://localhost"), context)).status).toBe(
      403,
    );
    expect(mocks.signups).not.toHaveBeenCalled();
  });
  it("publishes exactly the saved draft", async () => {
    expect(
      (await PATCH(patch({ action: "publish", revision: 3 }), context)).status,
    ).toBe(200);
    expect(mocks.update).toHaveBeenCalledWith(id, owner, 3, {
      published: draft,
      published_at: expect.any(String),
    });
  });
  it("does not change published content when generating", async () => {
    mocks.generate.mockResolvedValue({ name: "New design" });
    await PATCH(
      patch({ action: "generate", revision: 3, instruction: "Make it blue" }),
      context,
    );
    expect(mocks.update).toHaveBeenCalledWith(id, owner, 3, {
      draft: { name: "New design" },
    });
  });
  it("rejects stale revisions before making a model call", async () => {
    expect(
      (
        await PATCH(
          patch({ action: "generate", revision: 2, instruction: "Change it" }),
          context,
        )
      ).status,
    ).toBe(409);
    expect(mocks.generate).not.toHaveBeenCalled();
  });
  it("reports concurrent updates without claiming success", async () => {
    mocks.update.mockResolvedValue(null);
    expect(
      (await PATCH(patch({ action: "publish", revision: 3 }), context)).status,
    ).toBe(409);
  });
  it("keeps saved state when generation fails", async () => {
    mocks.generate.mockRejectedValue(new Error("Unavailable"));
    expect(
      (
        await PATCH(
          patch({ action: "generate", revision: 3, instruction: "Change it" }),
          context,
        )
      ).status,
    ).toBe(503);
    expect(mocks.update).not.toHaveBeenCalled();
  });
  it("rejects publishing before generation", async () => {
    mocks.select.mockResolvedValue({ ...site, draft: null });
    expect(
      (await PATCH(patch({ action: "publish", revision: 3 }), context)).status,
    ).toBe(400);
  });
  it("unpublishes without deleting the draft", async () => {
    await PATCH(patch({ action: "unpublish", revision: 3 }), context);
    expect(mocks.update).toHaveBeenCalledWith(id, owner, 3, {
      published: null,
      published_at: null,
    });
  });
  it("rejects client-supplied account identity", async () => {
    const response = await POST(
      new Request("http://localhost/api/sites", {
        method: "POST",
        body: JSON.stringify({
          name: "Release",
          brief: "A page",
          account_id: owner,
        }),
      }),
    );
    expect(response.status).toBe(400);
    expect(mocks.insert).not.toHaveBeenCalled();
  });
});
