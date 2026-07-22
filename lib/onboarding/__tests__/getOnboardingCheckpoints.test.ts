import { describe, expect, it } from "vitest";
import { getOnboardingCheckpoints } from "@/lib/onboarding/getOnboardingCheckpoints";

describe("getOnboardingCheckpoints", () => {
  it("returns all four checkpoints in sequence order", () => {
    const checkpoints = getOnboardingCheckpoints({
      artists: [],
      catalogs: [],
      tasks: [],
    });
    expect(checkpoints.map((c) => c.id)).toEqual([
      "artists",
      "socials",
      "catalog",
      "task",
    ]);
    expect(checkpoints.every((c) => !c.complete)).toBe(true);
  });

  it("marks each checkpoint complete from account state, independently", () => {
    const checkpoints = getOnboardingCheckpoints({
      artists: [{ account_socials: [{ id: "s1" }] }],
      catalogs: [],
      tasks: [{ enabled: true }],
    });
    expect(checkpoints).toEqual([
      { id: "artists", complete: true },
      { id: "socials", complete: true },
      { id: "catalog", complete: false },
      { id: "task", complete: true },
    ]);
  });

  it("keeps socials incomplete while the roster is empty", () => {
    const checkpoints = getOnboardingCheckpoints({
      artists: [],
      catalogs: [{ id: "c1" }],
      tasks: [],
    });
    expect(checkpoints.find((c) => c.id === "socials")?.complete).toBe(false);
  });
});
