import { beforeEach, describe, expect, it, vi } from "vitest";
import { getTaskRuns } from "@/lib/tasks/getTaskRuns";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

vi.mock("@/lib/api/getClientApiBaseUrl", () => ({
  getClientApiBaseUrl: vi.fn(),
}));

describe("getTaskRuns", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getClientApiBaseUrl).mockReturnValue("https://api.recoupable.com");
  });

  it("calls /api/tasks/runs with bearer token and default limit", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ status: "success", runs: [] }),
    }) as unknown as typeof fetch;

    await getTaskRuns("token-123");

    expect(fetch).toHaveBeenCalledWith(
      "https://api.recoupable.com/api/tasks/runs?limit=20",
      expect.objectContaining({
        method: "GET",
        headers: { Authorization: "Bearer token-123" },
      }),
    );
  });

  it("passes account_id override when provided", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ status: "success", runs: [] }),
    }) as unknown as typeof fetch;

    await getTaskRuns("token-123", { accountIdOverride: "acc_456" });

    expect(fetch).toHaveBeenCalledWith(
      "https://api.recoupable.com/api/tasks/runs?limit=20&account_id=acc_456",
      expect.any(Object),
    );
  });

  it("sends empty bearer when token is null", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: vi.fn().mockResolvedValue({ status: "error", error: "Unauthorized" }),
    }) as unknown as typeof fetch;

    await expect(getTaskRuns(null)).rejects.toThrow("Unauthorized");

    expect(fetch).toHaveBeenCalledWith(
      "https://api.recoupable.com/api/tasks/runs?limit=20",
      expect.objectContaining({
        headers: { Authorization: "Bearer " },
      }),
    );
  });
});
