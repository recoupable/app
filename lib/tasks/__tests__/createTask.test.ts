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
    vi.mocked(getClientApiBaseUrl).mockReturnValue("https://api.recoupable.com");
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

    expect(fetch).toHaveBeenCalledWith("https://api.recoupable.com/api/tasks", {
      method: "POST",
      headers: {
        Authorization: "Bearer test-token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Daily summary",
        prompt: "Summarize fan growth",
        schedule: "0 9 * * *",
        artist_account_id: "artist-1",
      }),
    });
    expect(result).toEqual(createdTask);
  });

  it("includes optional model when provided", async () => {
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
      model: "anthropic/claude-sonnet-4.5",
    });

    const call = vi.mocked(fetch).mock.calls[0];
    const init = call[1] as RequestInit;
    expect(init.body).toBe(
      JSON.stringify({
        title: "Weekly sync",
        prompt: "Generate weekly report",
        schedule: "0 9 * * 1",
        artist_account_id: "artist-2",
        model: "anthropic/claude-sonnet-4.5",
      }),
    );
  });

  it("throws on non-ok HTTP response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      text: vi.fn().mockResolvedValue('{"status":"error","error":"Access denied"}'),
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
