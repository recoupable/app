import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTask } from "@/lib/tasks/createTask";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

vi.mock("@/lib/api/getClientApiBaseUrl", () => ({
  getClientApiBaseUrl: vi.fn(),
}));

describe("createTask", () => {
  const accessToken = "test-token";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getClientApiBaseUrl).mockReturnValue(
      "https://api.recoupable.com",
    );
  });

  it("calls POST /api/tasks with bearer auth and required payload", async () => {
    const createdTask = { id: "task-1" };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        status: "success",
        tasks: [createdTask],
      }),
    }) as unknown as typeof fetch;

    const result = await createTask(accessToken, {
      title: "Daily summary",
      prompt: "Summarize fan growth",
      schedule: "0 9 * * *",
      artist_account_id: "artist-1",
    });

    expect(fetch).toHaveBeenCalledWith(
      "https://api.recoupable.com/api/tasks",
      expect.objectContaining({
        method: "POST",
        headers: {
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        },
      }),
    );
    const init = vi.mocked(fetch).mock.calls[0][1] as RequestInit;
    expect(JSON.parse(String(init.body))).toEqual({
      title: "Daily summary",
      prompt: "Summarize fan growth",
      schedule: "0 9 * * *",
      artist_account_id: "artist-1",
    });
    expect(result).toEqual(createdTask);
  });

  it("includes optional account_id and model when provided", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        status: "success",
        tasks: [{ id: "task-2" }],
      }),
    }) as unknown as typeof fetch;

    await createTask(accessToken, {
      title: "Weekly sync",
      prompt: "Generate weekly report",
      schedule: "0 9 * * 1",
      artist_account_id: "artist-2",
      account_id: "account-2",
      model: "anthropic/claude-sonnet-4.5",
    });

    const call = vi.mocked(fetch).mock.calls[0];
    const init = call[1] as RequestInit;
    expect(JSON.parse(String(init.body))).toEqual({
      title: "Weekly sync",
      prompt: "Generate weekly report",
      schedule: "0 9 * * 1",
      artist_account_id: "artist-2",
      account_id: "account-2",
      model: "anthropic/claude-sonnet-4.5",
    });
  });
});
