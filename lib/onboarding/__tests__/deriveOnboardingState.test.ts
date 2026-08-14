import { describe, expect, it } from "vitest";
import { deriveOnboardingState } from "@/lib/onboarding/deriveOnboardingState";

const readyInput = {
  authenticated: true,
  artists: [{ account_socials: [{}] }],
  artistsLoading: false,
  artistsError: false,
  catalogs: [{}],
  catalogsReady: true,
  tasks: [{ enabled: true }],
  tasksReady: true,
};

describe("deriveOnboardingState", () => {
  it("is ready with a derived step once every source resolved", () => {
    const state = deriveOnboardingState(readyInput);
    expect(state.isReady).toBe(true);
    expect(state.step).toBe("complete");
    expect(state.checkpoints).toHaveLength(4);
  });

  it("is not ready while the roster is loading", () => {
    expect(
      deriveOnboardingState({ ...readyInput, artistsLoading: true }).isReady,
    ).toBe(false);
  });

  it("fails open when the roster fetch errored (isReady false -> view none)", () => {
    expect(
      deriveOnboardingState({ ...readyInput, artistsError: true }).isReady,
    ).toBe(false);
  });

  it("is not ready when catalogs or tasks have not resolved", () => {
    expect(
      deriveOnboardingState({ ...readyInput, catalogsReady: false }).isReady,
    ).toBe(false);
    expect(
      deriveOnboardingState({ ...readyInput, tasksReady: false }).isReady,
    ).toBe(false);
  });

  it("is not ready while unauthenticated", () => {
    expect(
      deriveOnboardingState({ ...readyInput, authenticated: false }).isReady,
    ).toBe(false);
  });

  it("treats missing source data as empty state", () => {
    const state = deriveOnboardingState({
      ...readyInput,
      artists: undefined,
      catalogs: undefined,
      tasks: undefined,
    });
    expect(state.step).toBe("artists");
    expect(state.checkpoints.every((c) => !c.complete)).toBe(true);
  });
});
