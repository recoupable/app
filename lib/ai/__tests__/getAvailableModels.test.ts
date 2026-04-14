import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@ai-sdk/gateway", () => ({
  gateway: {
    getAvailableModels: vi.fn(),
  },
}));

import { gateway } from "@ai-sdk/gateway";
import { getAvailableModels } from "../getAvailableModels";

describe("getAvailableModels", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns only gateway models (no fal-ai entries)", async () => {
    vi.mocked(gateway.getAvailableModels).mockResolvedValue({
      models: [
        {
          id: "openai/gpt-5.2",
          name: "GPT-5.2",
          specification: { specificationVersion: "v2", provider: "openai", modelId: "gpt-5.2" },
        },
      ],
    } as never);

    const models = await getAvailableModels();

    expect(models.some((m) => m.id.startsWith("fal-ai/"))).toBe(false);
    expect(models).toHaveLength(1);
    expect(models[0].id).toBe("openai/gpt-5.2");
  });

  it("returns empty array when gateway fetch fails", async () => {
    vi.mocked(gateway.getAvailableModels).mockRejectedValue(new Error("boom"));

    const models = await getAvailableModels();

    expect(models).toEqual([]);
  });
});
