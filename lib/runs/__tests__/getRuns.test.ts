import { beforeEach, describe, expect, it, vi } from "vitest";
import { getRuns } from "@/lib/runs/getRuns";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

vi.mock("@/lib/api/getClientApiBaseUrl", () => ({
  getClientApiBaseUrl: vi.fn(),
}));

describe("getRuns", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getClientApiBaseUrl).mockReturnValue("https://api.example.com");
  });

  it("GETs the caller's latest valuation run with bearer auth", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        status: "success",
        runs: [{ id: "run_1", kind: "valuation", state: "measuring" }],
      }),
    }) as unknown as typeof fetch;

    const result = await getRuns("tok");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.example.com/api/runs?kind=valuation&limit=1",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({ Authorization: "Bearer tok" }),
      }),
    );
    expect(result.runs[0].state).toBe("measuring");
  });

  it("throws on a non-ok response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: vi.fn().mockResolvedValue("unauthorized"),
    }) as unknown as typeof fetch;

    await expect(getRuns("tok")).rejects.toThrow("401");
  });
});
