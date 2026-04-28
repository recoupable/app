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
  });

  it("falls back to local delete endpoint when scheduler says not found", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: vi.fn().mockResolvedValue("Schedule not found"),
      })
      .mockResolvedValueOnce({
        ok: true,
      }) as unknown as typeof fetch;

    await expect(deleteTask(accessToken, { id: "task-1" })).resolves.toBeUndefined();

    expect(fetch).toHaveBeenNthCalledWith(
      2,
      "/api/scheduled-actions/delete",
      expect.objectContaining({
        method: "DELETE",
      }),
    );
  });

  it("falls back to local delete endpoint when JSON error says scheduler not found", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          status: "error",
          error: "Schedule not found",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
      }) as unknown as typeof fetch;

    await expect(deleteTask(accessToken, { id: "task-1" })).resolves.toBeUndefined();

    expect(fetch).toHaveBeenNthCalledWith(
      2,
      "/api/scheduled-actions/delete",
      expect.objectContaining({
        method: "DELETE",
      }),
    );
  });

  it("throws when local fallback delete endpoint fails", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: vi.fn().mockResolvedValue("Schedule not found"),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: vi.fn().mockResolvedValue("local delete failed"),
      }) as unknown as typeof fetch;

    await expect(deleteTask(accessToken, { id: "task-1" })).rejects.toThrow(
      "HTTP 500: local delete failed",
    );
  });
});
