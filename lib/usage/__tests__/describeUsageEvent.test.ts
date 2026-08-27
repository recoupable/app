import { describe, expect, it } from "vitest";
import describeUsageEvent from "@/lib/usage/describeUsageEvent";

describe("describeUsageEvent", () => {
  it("names the surface and the agent that ran", () => {
    expect(describeUsageEvent({ source: "api", agent_type: "main" })).toBe(
      "api · main",
    );
  });

  it("falls back to the source alone when there is no agent type", () => {
    expect(describeUsageEvent({ source: "chat", agent_type: null })).toBe(
      "chat",
    );
  });
});
