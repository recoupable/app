import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateTask } from "@/lib/tasks/updateTask";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

vi.mock("@/lib/api/getClientApiBaseUrl", () => ({
  getClientApiBaseUrl: vi.fn(),
}));

describe("updateTask", () => {
  const accessToken = "test-token";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getClientApiBaseUrl).mockReturnValue("https://api.recoupable.com");
  });

  it("calls PATCH /api/tasks with bearer auth", async () => {
    const updatedTask = { id: "task-1", title: "Updated" };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        status: "success",
        tasks: [updatedTask],
      }),
    }) as unknown as typeof fetch;

    const result = await updateTask(accessToken, {
      id: "task-1",
      title: "Updated",
    });

    expect(fetch).toHaveBeenCalledWith(
      "https://api.recoupable.com/api/tasks",
      expect.objectContaining({
        method: "PATCH",
        headers: {
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        },
      }),
    );
    expect(result).toEqual(updatedTask);
  });

  it("includes timezone in the body when provided", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        status: "success",
        tasks: [{ id: "task-1" }],
      }),
    }) as unknown as typeof fetch;

    await updateTask(accessToken, {
      id: "task-1",
      schedule: "0 9 * * 1",
      timezone: "Europe/London",
    });

    const init = vi.mocked(fetch).mock.calls[0][1] as RequestInit;
    expect(JSON.parse(String(init.body))).toEqual({
      id: "task-1",
      schedule: "0 9 * * 1",
      timezone: "Europe/London",
    });
  });
});
