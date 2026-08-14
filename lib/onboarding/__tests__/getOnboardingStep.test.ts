import { describe, expect, it } from "vitest";
import { getOnboardingStep } from "@/lib/onboarding/getOnboardingStep";
import type {
  OnboardingAccountState,
  OnboardingStep,
} from "@/lib/onboarding/types";

interface StateFlags {
  hasArtists: boolean;
  allArtistsHaveSocials: boolean;
  hasCatalog: boolean;
  hasEnabledTask: boolean;
}

const makeState = ({
  hasArtists,
  allArtistsHaveSocials,
  hasCatalog,
  hasEnabledTask,
}: StateFlags): OnboardingAccountState => ({
  artists: hasArtists
    ? [{ account_socials: allArtistsHaveSocials ? [{ id: "s1" }] : [] }]
    : [],
  catalogs: hasCatalog ? [{ id: "c1" }] : [],
  tasks: hasEnabledTask ? [{ enabled: true }] : [],
});

/** Mirrors the spec's predicate priority: first unmet checkpoint wins. */
const expectedStep = (flags: StateFlags): OnboardingStep => {
  if (!flags.hasArtists) return "artists";
  if (!flags.allArtistsHaveSocials) return "socials";
  if (!flags.hasCatalog) return "catalog";
  if (!flags.hasEnabledTask) return "task";
  return "complete";
};

describe("getOnboardingStep", () => {
  it("derives the first unmet step for every predicate combination", () => {
    const bools = [false, true];
    for (const hasArtists of bools) {
      for (const allArtistsHaveSocials of bools) {
        for (const hasCatalog of bools) {
          for (const hasEnabledTask of bools) {
            const flags = {
              hasArtists,
              allArtistsHaveSocials,
              hasCatalog,
              hasEnabledTask,
            };
            expect(
              getOnboardingStep(makeState(flags)),
              JSON.stringify(flags),
            ).toBe(expectedStep(flags));
          }
        }
      }
    }
  });

  it("returns artists for a brand-new empty account", () => {
    expect(getOnboardingStep({ artists: [], catalogs: [], tasks: [] })).toBe(
      "artists",
    );
  });

  it("auto-advances past steps completed out-of-band (valuation auto-claim)", () => {
    // The marketing valuation auto-creates artist + catalog with socials
    // before the user ever lands on chat: derived step must skip to task.
    expect(
      getOnboardingStep({
        artists: [{ account_socials: [{ id: "s1" }] }],
        catalogs: [{ id: "c1" }],
        tasks: [],
      }),
    ).toBe("task");
  });

  it("returns complete for a fully activated account", () => {
    expect(
      getOnboardingStep({
        artists: [{ account_socials: [{ id: "s1" }] }],
        catalogs: [{ id: "c1" }],
        tasks: [{ enabled: false }, { enabled: true }],
      }),
    ).toBe("complete");
  });

  it("never depends on stored cursor state: same inputs, same step", () => {
    const state: OnboardingAccountState = {
      artists: [{ account_socials: [] }],
      catalogs: [],
      tasks: [],
    };
    expect(getOnboardingStep(state)).toBe(getOnboardingStep(state));
  });
});
