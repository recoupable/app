import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTask } from "@/lib/tasks/createTask";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

vi.mock("@/lib/api/getClientApiBaseUrl", () => ({
  getClientApiBaseUrl: vi.fn(),
}));

describe("createTask error handling", () => {
  const accessToken = "test-token";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getClientApiBaseUrl).mockReturnValue(
      "https://api.recoupable.com",
    );
  });

  it("throws on non-ok HTTP response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      text: vi
        .fn()
        .mockResolvedValue('{"status":"error","error":"Access denied"}'),
    }) as unknown as typeof fetch;

    await expect(
      createTask(accessToken, {
        title: "Denied",
        prompt: "Denied",
        schedule: "0 9 * * *",
        artist_account_id: "artist-3",
      }),
    ).rejects.toThrow('HTTP 403: {"status":"error","error":"Access denied"}');
  });

  it("throws when API returns status:error", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        status: "error",
        error: "Validation failed",
      }),
    }) as unknown as typeof fetch;

    await expect(
      createTask(accessToken, {
        title: "Invalid",
        prompt: "Invalid",
        schedule: "0 9 * * *",
        artist_account_id: "artist-4",
      }),
    ).rejects.toThrow("Validation failed");
  });

  it("throws when success response has no created task", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        status: "success",
        tasks: [],
      }),
    }) as unknown as typeof fetch;

    await expect(
      createTask(accessToken, {
        title: "No task",
        prompt: "No task",
        schedule: "0 9 * * *",
        artist_account_id: "artist-5",
      }),
    ).rejects.toThrow("API returned success but no task was created");
  });
});
