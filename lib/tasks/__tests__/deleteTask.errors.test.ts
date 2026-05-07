import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteTask } from "@/lib/tasks/deleteTask";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

vi.mock("@/lib/api/getClientApiBaseUrl", () => ({
  getClientApiBaseUrl: vi.fn(),
}));

describe("deleteTask error handling", () => {
  const accessToken = "test-token";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getClientApiBaseUrl).mockReturnValue("https://api.recoupable.com");
  });

  it("throws on non-ok HTTP response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      text: vi.fn().mockResolvedValue('{"status":"error","error":"Access denied to this task"}'),
    }) as unknown as typeof fetch;

    await expect(deleteTask(accessToken, { id: "task-1" })).rejects.toThrow(
      'HTTP 403: {"status":"error","error":"Access denied to this task"}',
    );
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("throws on non-ok when body is schedule not found (single API call)", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: vi.fn().mockResolvedValue("Schedule not found"),
    }) as unknown as typeof fetch;

    await expect(deleteTask(accessToken, { id: "task-1" })).rejects.toThrow(
      "HTTP 500: Schedule not found",
    );
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("throws when API returns status:error", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        status: "error",
        error: "Task not found",
      }),
    }) as unknown as typeof fetch;

    await expect(deleteTask(accessToken, { id: "task-1" })).rejects.toThrow("Task not found");
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("throws when API returns status:error with schedule not found (single API call)", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        status: "error",
        error: "Schedule not found",
      }),
    }) as unknown as typeof fetch;

    await expect(deleteTask(accessToken, { id: "task-1" })).rejects.toThrow("Schedule not found");
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
