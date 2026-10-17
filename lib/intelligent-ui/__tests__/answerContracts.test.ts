import { describe, expect, it } from "vitest";
import { surfaceSchema, componentSchema, type Surface } from "../schema";
import { applySurfaceEvent } from "../applySurfaceEvent";
import { getCompletedExample } from "../playground/getCompletedExample";
import { playgroundScenarios } from "../playground/scenarios";
import { computeDistribution } from "../representations/computeDistribution";
import { describeConcentration } from "../representations/describeConcentration";
import { getActiveSection } from "../representations/getActiveSection";
import { getRepresentationText } from "../representations/getRepresentationText";
import { getAnswerText } from "../presentation/getAnswerText";

const listening = getCompletedExample(
  playgroundScenarios.find((item) => item.id === "listening")!,
);
const song = getCompletedExample(
  playgroundScenarios.find((item) => item.id === "song")!,
);

describe("coherent answer contracts", () => {
  it("requires answer and bound data to share a revision", () => {
    const changed = structuredClone(listening);
    changed.revision++;
    expect(surfaceSchema.safeParse(changed).success).toBe(false);
    expect(() =>
      applySurfaceEvent(listening, {
        type: "surface.patch",
        surfaceId: listening.id,
        baseRevision: 2,
        revision: 3,
        upsert: [],
        remove: [],
      }),
    ).toThrow("A patch to an answered surface requires a fresh answer");
    expect(listening.revision).toBe(2);
    expect(
      applySurfaceEvent(listening, {
        type: "surface.patch",
        surfaceId: listening.id,
        baseRevision: 2,
        revision: 3,
        upsert: [],
        remove: [],
        answer: { ...listening.answer!, revision: 3 },
      }).revision,
    ).toBe(3);
  });

  it("rejects orphaned representations, sources, incompatible calculations and duplicate parts", () => {
    for (const mutate of [
      (surface: Surface) => {
        surface.components = [];
      },
      (surface: Surface) => {
        surface.evidence = [];
      },
      (surface: Surface) => {
        surface.answer!.parts.push(surface.answer!.parts[0]);
      },
      (surface: Surface) => {
        surface.answer!.parts.push({
          type: "sources",
          id: "empty",
          evidenceIds: [],
        });
      },
      (surface: Surface) => {
        surface.answer!.parts.push({
          type: "representation",
          id: "duplicate-view",
          componentId: "listening-share",
          benefit: "show-distribution",
        });
      },
      (surface: Surface) => {
        surface.answer!.parts[0] = {
          type: "insight",
          id: "bad",
          componentId: "listening-share",
          calculation: "top-share",
          count: 20,
        };
      },
    ]) {
      const changed = structuredClone(listening);
      mutate(changed);
      expect(surfaceSchema.safeParse(changed).success).toBe(false);
    }
    const changed = structuredClone(song);
    changed.answer!.parts[1] = {
      type: "insight",
      id: "bad",
      componentId: "section-study",
      calculation: "top-share",
      count: 2,
    };
    expect(surfaceSchema.safeParse(changed).success).toBe(false);
  });

  it("does not accept generated callbacks, URLs or executable calculations", () => {
    const changed = structuredClone(song);
    Object.assign(changed.components[0], {
      onClick: "play()",
      url: "https://example.com/audio",
    });
    expect(surfaceSchema.safeParse(changed).success).toBe(false);
    const changedAnswer = structuredClone(song);
    Object.assign(changedAnswer.answer!.parts[0], { code: "fetch()" });
    expect(surfaceSchema.safeParse(changedAnswer).success).toBe(false);
  });
});

describe("representation meaning", () => {
  it("names only contributing records and uses singular agreement", () => {
    const component = structuredClone(listening.components[0]);
    if (component.type !== "distribution")
      throw new Error("Expected distribution");
    expect(describeConcentration(component, 1)).toContain(
      "Glasshouse accounts for 42%",
    );
    component.items.slice(1).forEach((item) => (item.value = 0));
    expect(describeConcentration(component, 2)).toBe(
      "Glasshouse accounts for 100% of the plays in this selection.",
    );
  });
  it("uses identical arithmetic for the headline, ranked bars and text alternative", () => {
    const component = structuredClone(listening.components[0]);
    if (component.type !== "distribution")
      throw new Error("Expected distribution");
    const result = computeDistribution(component);
    expect(result.total).toBe(1000000);
    expect(result.share).toBe(0.72);
    expect(describeConcentration(component, 2)).toContain("72%");
    expect(getRepresentationText(component)).toContain(
      "Total supplied: 1,000,000 plays.",
    );
    component.items[0].value = 0;
    expect(describeConcentration(component, 2)).toContain(
      "Low Tide and After Hours account for 79.3%",
    );
    expect(computeDistribution(component).total).toBe(580000);
    const changed = { ...listening, components: [component] };
    expect(getAnswerText(changed)).toContain("Total supplied: 580,000 plays.");
    expect(getAnswerText(changed)).not.toContain("1,000,000");
    component.items.forEach((item) => (item.value = 0));
    expect(describeConcentration(component, 2)).toContain("no plays");
    expect(computeDistribution(component).share).toBe(0);
  });

  it("rejects negative/nonfinite values, inconsistent coverage and reversed reporting windows", () => {
    const component = structuredClone(listening.components[0]);
    if (component.type !== "distribution")
      throw new Error("Expected distribution");
    for (const value of [-1, Infinity, NaN])
      expect(
        componentSchema.safeParse({
          ...component,
          items: component.items.map((item, index) =>
            index === 0 ? { ...item, value } : item,
          ),
        }).success,
      ).toBe(false);
    expect(
      componentSchema.safeParse({ ...component, totalCount: 9 }).success,
    ).toBe(false);
    expect(
      componentSchema.safeParse({
        ...component,
        measure: { ...component.measure, periodEnd: "2026-01-01" },
      }).success,
    ).toBe(false);
    expect(
      componentSchema.safeParse({
        ...component,
        complete: false,
        totalCount: 9,
      }).success,
    ).toBe(true);
  });

  it("keeps media intervals bounded, ordered and independent of playback availability", () => {
    const component = structuredClone(song.components[0]);
    if (component.type !== "timeline") throw new Error("Expected timeline");
    expect(getActiveSection(component, 28)?.id).toBe("chorus");
    expect(getActiveSection(component, 48)?.id).toBe("outro");
    expect(getActiveSection(component, -1)).toBeUndefined();
    expect(
      componentSchema.safeParse({ ...component, durationSeconds: 30 }).success,
    ).toBe(false);
    component.sections[1].start = 7;
    expect(componentSchema.safeParse(component).success).toBe(false);
    component.sections[1].start = 8;
    delete component.media;
    expect(componentSchema.safeParse(component).success).toBe(true);
    expect(getRepresentationText(component)).toContain("0:28–0:40 · Chorus");
  });
});
