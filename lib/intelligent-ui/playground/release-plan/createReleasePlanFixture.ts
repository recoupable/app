import { releaseProtocolScenario } from "../releaseProtocolScenario";
import type { ReleasePlanFixture } from "./types";

/** Identity and material claims come from the existing synthetic worksheet, not a customer. */
export function createReleasePlanFixture(): ReleasePlanFixture {
  const source = releaseProtocolScenario.initial;
  return {
    scope: {
      authority: "fixture",
      workspaceId: source.context.workspaceId,
      releaseId: source.context.subject!.id,
      sourceId: "delivery-sheet",
      sourceRevision: 3,
      fixtureRevision: 1,
      purpose: "local-release-planning",
    },
    label: source.context.subject!.label,
    sourceText: source.evidence.find((item) => item.id === "delivery-sheet")!
      .text,
    // Authored planning defaults, not dates or assignments asserted by the worksheet.
    initial: {
      goal: "Collect the missing materials for review.",
      releaseDate: "2026-11-20",
      timeZone: "America/New_York",
      tasks: [
        { id: "artwork", anchor: "release", offsetDays: -14, manualDate: null },
        {
          id: "documentation",
          anchor: "release",
          offsetDays: -14,
          manualDate: null,
        },
        {
          id: "review",
          anchor: "documentation",
          offsetDays: 2,
          manualDate: null,
        },
      ],
    },
  };
}
