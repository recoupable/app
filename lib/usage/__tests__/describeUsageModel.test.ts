import { describe, expect, it } from "vitest";
import describeUsageModel from "@/lib/usage/describeUsageModel";

describe("describeUsageModel", () => {
  it("shows the model alone, never the third-party provider", () => {
    expect(
      describeUsageModel({ provider: "fal", model_id: "minimax/music-3" }),
    ).toBe("minimax/music-3");
  });

  it("shows the model when the provider is unknown", () => {
    expect(describeUsageModel({ provider: null, model_id: "gpt-5" })).toBe(
      "gpt-5",
    );
  });

  it("shows a dash for a charge with no model, such as a fixed-price research call", () => {
    expect(describeUsageModel({ provider: null, model_id: null })).toBe("-");
  });
});
