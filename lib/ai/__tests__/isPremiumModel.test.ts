import { describe, it, expect } from "vitest";
import { isPremiumModel } from "../isPremiumModel";
import { GatewayLanguageModelEntry } from "@ai-sdk/gateway";

const makeModel = (pricing?: { input: string; output: string }) =>
  ({
    id: "test/model",
    name: "Test Model",
    pricing,
    specification: {
      specificationVersion: "v2",
      provider: "test",
      modelId: "test/model",
    },
  }) as unknown as GatewayLanguageModelEntry;

describe("isPremiumModel", () => {
  it("returns true for expensive frontier pricing", () => {
    // $15/M input, $75/M output (Opus class)
    expect(
      isPremiumModel(makeModel({ input: "0.000015", output: "0.000075" })),
    ).toBe(true);
  });

  it("returns false for cheap pricing within the free tier", () => {
    // $0.40/M input, $1.60/M output
    expect(
      isPremiumModel(makeModel({ input: "0.0000004", output: "0.0000016" })),
    ).toBe(false);
  });

  it("treats missing pricing as premium", () => {
    expect(isPremiumModel(makeModel(undefined))).toBe(true);
  });

  it("treats unparseable pricing as premium", () => {
    expect(isPremiumModel(makeModel({ input: "n/a", output: "n/a" }))).toBe(
      true,
    );
  });
});
