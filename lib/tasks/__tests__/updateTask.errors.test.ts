import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateTask } from "@/lib/tasks/updateTask";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

vi.mock("@/lib/api/getClientApiBaseUrl", () => ({
  getClientApiBaseUrl: vi.fn(),
}));

describe("updateTask error handling", () => {
  const accessToken = "test-token";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getClientApiBaseUrl).mockReturnValue("https://api.recoupable.com");
  });

  it("throws on non-ok HTTP response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: vi.fn().mockResolvedValue('{"status":"error","error":"Invalid request"}'),
    }) as unknown as typeof fetch;

    await expect(updateTask(accessToken, { id: "bad-id" })).rejects.toThrow(
      'HTTP 400: {"status":"error","error":"Invalid request"}',
    );
  });

  it("throws when API returns status:error", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        status: "error",
        error: "Validation failed",
      }),
    }) as unknown as typeof fetch;

    await expect(updateTask(accessToken, { id: "task-1" })).rejects.toThrow(
      "Validation failed",
    );
  });
});
