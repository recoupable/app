import { describe, it, expect } from "vitest";
import { organizeModels } from "../organizeModels";

describe("organizeModels", () => {
  it("returns only featuredModels and otherModels (no hasGatewayModels field)", () => {
    const result = organizeModels([]);
    expect(Object.keys(result).sort()).toEqual(["featuredModels", "otherModels"]);
  });

  it("splits featured and non-featured gateway models", () => {
    const models = [
      {
        id: "openai/gpt-5.2",
        name: "gpt-5.2",
        specification: { specificationVersion: "v2", provider: "openai", modelId: "gpt-5.2" },
      },
      {
        id: "some/other-model",
        name: "Other",
        specification: { specificationVersion: "v2", provider: "some", modelId: "other-model" },
      },
    ] as never;

    const result = organizeModels(models);
    expect(result.featuredModels.map((m) => m.id)).toContain("openai/gpt-5.2");
    expect(result.otherModels.map((m) => m.id)).toEqual(["some/other-model"]);
  });
});
