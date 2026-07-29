import { describe, it, expect } from "vitest";
import { dedupeModels } from "../dedupeModels";
import { GatewayLanguageModelEntry } from "@ai-sdk/gateway";

const makeModel = (id: string, name: string) =>
  ({
    id,
    name,
    specification: {
      specificationVersion: "v2",
      provider: id.split("/")[0],
      modelId: id,
    },
  }) as unknown as GatewayLanguageModelEntry;

describe("dedupeModels", () => {
  it("returns distinct models unchanged and preserves order", () => {
    const models = [
      makeModel("openai/gpt-5.5", "GPT-5.5"),
      makeModel("anthropic/claude-opus-4.8", "Claude Opus 4.8"),
    ];
    expect(dedupeModels(models)).toEqual(models);
  });

  it("drops later entries with a duplicate id", () => {
    const first = makeModel("openai/gpt-5.2", "GPT 5.2");
    const dupe = makeModel("openai/gpt-5.2", "GPT 5.2 (alias)");
    expect(dedupeModels([first, dupe])).toEqual([first]);
  });

  it("drops alias entries sharing the same display name", () => {
    const canonical = makeModel(
      "alibaba/qwen3-235b-a22b-thinking",
      "Qwen3 VL 235B A22B Thinking",
    );
    const alias = makeModel(
      "alibaba/qwen3-vl-thinking",
      "Qwen3 VL 235B A22B Thinking",
    );
    expect(dedupeModels([canonical, alias])).toEqual([canonical]);
  });

  it("normalizes case and whitespace when comparing names", () => {
    const first = makeModel("a/one", "GPT  5.2");
    const dupe = makeModel("b/two", "gpt 5.2");
    expect(dedupeModels([first, dupe])).toEqual([first]);
  });

  it("returns an empty array for empty input", () => {
    expect(dedupeModels([])).toEqual([]);
  });
});
