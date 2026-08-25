import { beforeEach, describe, expect, it, vi } from "vitest";
import { createStarterTask } from "@/lib/home/createStarterTask";
import { buildFirstTaskPrompt } from "@/lib/onboarding/buildFirstTaskPrompt";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import { DEFAULT_MODEL } from "@/lib/consts";

vi.mock("@/lib/api/getClientApiBaseUrl", () => ({
  getClientApiBaseUrl: vi.fn(),
}));

const input = {
  artistName: "Del Water Gap",
  artistAccountId: "artist-1",
  recipientEmail: "manager@example.com",
  timezone: "America/New_York",
};

describe("createStarterTask", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getClientApiBaseUrl).mockReturnValue(
      "https://api.recoupable.com",
    );
  });

  it("POSTs the shared weekly report task to /api/tasks", async () => {
    const createdTask = { id: "task-1" };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        status: "success",
        tasks: [createdTask],
      }),
    }) as unknown as typeof fetch;

    const result = await createStarterTask("test-token", input);

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
    const body = JSON.parse(String(init.body));
    expect(body.title).toBe("Weekly Catalog Report: Del Water Gap");
    expect(body.schedule).toBe("0 9 * * 1");
    expect(body.artist_account_id).toBe("artist-1");
    expect(body.model).toBe(DEFAULT_MODEL);
    expect(body.timezone).toBe("America/New_York");
    expect(result).toEqual(createdTask);
  });

  it("schedules exactly the onboarding prompt (run voice, emailed to the account)", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi
        .fn()
        .mockResolvedValue({ status: "success", tasks: [{ id: "t" }] }),
    }) as unknown as typeof fetch;

    await createStarterTask("test-token", input);

    const init = vi.mocked(fetch).mock.calls[0][1] as RequestInit;
    const body = JSON.parse(String(init.body));
    expect(body.prompt).toBe(
      buildFirstTaskPrompt({
        artistName: "Del Water Gap",
        artistAccountId: "artist-1",
        recipientEmail: "manager@example.com",
      }),
    );
    expect(body.prompt).not.toMatch(/^Set up a/);
    expect(body.prompt).toContain("manager@example.com");
  });

  it("propagates API errors", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: vi.fn().mockResolvedValue("boom"),
    }) as unknown as typeof fetch;

    await expect(createStarterTask("test-token", input)).rejects.toThrow(
      "HTTP 500",
    );
  });
});
