import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ select: vi.fn(), insert: vi.fn() }));
vi.mock("@/lib/supabase/sites/selectSite", () => ({
  selectSite: mocks.select,
}));
vi.mock("@/lib/supabase/sites/insertSignup", () => ({
  insertSignup: mocks.insert,
}));
import { GET } from "@/app/s/[id]/route";
import { POST } from "@/app/s/[id]/signup/route";
const context = {
  params: Promise.resolve({ id: "11111111-1111-4111-8111-111111111111" }),
};
const request = (fields: Record<string, string>) =>
  new Request("https://example.test/s/id/signup", {
    method: "POST",
    body: new URLSearchParams(fields),
  });
beforeEach(() => {
  vi.resetAllMocks();
});
describe("public sites", () => {
  it("never serves unpublished drafts", async () => {
    mocks.select.mockResolvedValue({
      draft: { name: "Private" },
      published: null,
    });
    expect(
      (await GET(new Request("https://example.test"), context)).status,
    ).toBe(404);
  });
  it("requires explicit email consent", async () => {
    expect(
      (await POST(request({ email: "fan@example.com" }), context)).status,
    ).toBe(400);
    expect(mocks.insert).not.toHaveBeenCalled();
  });
  it("rejects honeypot submissions", async () => {
    expect(
      (
        await POST(
          request({
            email: "fan@example.com",
            consent: "yes",
            website: "spam",
          }),
          context,
        )
      ).status,
    ).toBe(400);
  });
  it("rejects signups after unpublishing", async () => {
    mocks.select.mockResolvedValue({ published: null });
    expect(
      (
        await POST(
          request({ email: "fan@example.com", consent: "yes" }),
          context,
        )
      ).status,
    ).toBe(404);
    expect(mocks.insert).not.toHaveBeenCalled();
  });
  it("stores consent against the published name, not the draft", async () => {
    mocks.select.mockResolvedValue({
      name: "Draft name",
      published: { name: "Published artist" },
    });
    expect(
      (
        await POST(
          request({ email: "fan@example.com", consent: "yes" }),
          context,
        )
      ).status,
    ).toBe(200);
    expect(mocks.insert).toHaveBeenCalledWith(
      expect.any(String),
      "fan@example.com",
      "I agree to receive email updates from Published artist.",
    );
  });
});
