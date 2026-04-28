import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteTask } from "@/lib/tasks/deleteTask";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

vi.mock("@/lib/api/getClientApiBaseUrl", () => ({
  getClientApiBaseUrl: vi.fn(),
}));

describe("deleteTask", () => {
  const accessToken = "test-token";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getClientApiBaseUrl).mockReturnValue("https://api.recoupable.com");
  });

  it("calls DELETE /api/tasks with bearer auth and id payload", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        status: "success",
      }),
    }) as unknown as typeof fetch;

    await deleteTask(accessToken, { id: "task-1" });

    expect(fetch).toHaveBeenCalledWith(
      "https://api.recoupable.com/api/tasks",
      expect.objectContaining({
        method: "DELETE",
        headers: {
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        },
      }),
    );
    const init = vi.mocked(fetch).mock.calls[0][1] as RequestInit;
    expect(JSON.parse(String(init.body))).toEqual({ id: "task-1" });
  });
});
