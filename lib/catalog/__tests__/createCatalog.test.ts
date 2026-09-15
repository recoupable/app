import { afterEach, describe, expect, it, vi } from "vitest";
import { createCatalog } from "../createCatalog";
vi.mock("@/lib/api/getClientApiBaseUrl", () => ({
  getClientApiBaseUrl: () => "https://api.example.test",
}));
afterEach(() => vi.unstubAllGlobals());
const id = "00000000-0000-4000-8000-000000000001";
describe("createCatalog", () => {
  it.each([null, "organization-id"])(
    "creates for workspace %s without requiring an artist",
    async (org) => {
      const fetcher = vi
        .fn()
        .mockResolvedValue({
          ok: true,
          json: async () => ({ catalog: { id } }),
        });
      vi.stubGlobal("fetch", fetcher);
      expect(await createCatalog("  Releases  ", "token", org)).toBe(id);
      expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual({
        name: "Releases",
        ...(org ? { organization_id: org } : {}),
      });
      expect(fetcher.mock.calls[0][1].headers.Authorization).toBe(
        "Bearer token",
      );
    },
  );
  it("surfaces creation errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue({
          ok: false,
          json: async () => ({ error: "Not a member" }),
        }),
    );
    await expect(createCatalog("Catalog", "token", "org")).rejects.toThrow(
      "Not a member",
    );
  });
});
