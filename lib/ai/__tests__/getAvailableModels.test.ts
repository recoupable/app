import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAvailableModels } from "../getAvailableModels";

const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof fetch;

describe("getAvailableModels", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns only gateway models (no fal-ai entries)", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        models: [
          {
            id: "openai/gpt-5.2",
            name: "GPT-5.2",
            specification: { specificationVersion: "v2", provider: "openai", modelId: "gpt-5.2", type: "language" },
          },
        ],
      }),
    });

    const models = await getAvailableModels();

    expect(models.some((m) => m.id.startsWith("fal-ai/"))).toBe(false);
    expect(models).toHaveLength(1);
    expect(models[0].id).toBe("openai/gpt-5.2");
  });

  it("returns empty array when gateway fetch fails", async () => {
    mockFetch.mockRejectedValue(new Error("boom"));

    const models = await getAvailableModels();

    expect(models).toEqual([]);
  });

  it("returns empty array when gateway returns non-OK", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });

    const models = await getAvailableModels();

    expect(models).toEqual([]);
  });
});
