import { beforeEach, describe, expect, it, vi } from "vitest";
import { createStarterTask } from "@/lib/home/createStarterTask";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import { DEFAULT_MODEL } from "@/lib/consts";

vi.mock("@/lib/api/getClientApiBaseUrl", () => ({
  getClientApiBaseUrl: vi.fn(),
}));

const starterTemplate = {
  id: "9046c7e9-fd5a-4f08-a472-381d51bd6c90",
  title: "Weekly Performance Dashboard",
  description: "Weekly stats email",
  prompt:
    "Set up a weekly performance dashboard that emails me every Monday with my stats from all platforms.",
  tags: ["Report"],
  creator: null,
  is_private: false,
  created_at: null,
  favorites_count: null,
  updated_at: null,
} as import("@/types/AgentTemplates").AgentTemplateRow;

describe("createStarterTask", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getClientApiBaseUrl).mockReturnValue(
      "https://api.recoupable.com",
    );
  });

  it("POSTs the pre-wired weekly report task to /api/tasks", async () => {
    const createdTask = { id: "task-1" };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        status: "success",
        tasks: [createdTask],
      }),
    }) as unknown as typeof fetch;

    const result = await createStarterTask("test-token", {
      template: starterTemplate,
      artistName: "Del Water Gap",
      artistAccountId: "artist-1",
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
    const body = JSON.parse(String(init.body));
    expect(body.title).toBe("Weekly Performance Dashboard — Del Water Gap");
    expect(body.schedule).toBe("0 9 * * 1");
    expect(body.artist_account_id).toBe("artist-1");
    expect(body.model).toBe(DEFAULT_MODEL);
    expect(body.prompt).toBe(starterTemplate.prompt);
    expect(result).toEqual(createdTask);
  });

  it("propagates API errors", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: vi.fn().mockResolvedValue("boom"),
    }) as unknown as typeof fetch;

    await expect(
      createStarterTask("test-token", {
        template: starterTemplate,
        artistName: "Del Water Gap",
        artistAccountId: "artist-1",
      }),
    ).rejects.toThrow("HTTP 500");
  });
});
