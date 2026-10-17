import type { DistributionComponent } from "../representations/schemas";
import { getRepresentationText } from "../representations/getRepresentationText";
import { describeConcentration } from "../representations/describeConcentration";
import { createComposedScenario } from "./createComposedScenario";

const distribution: DistributionComponent = {
  type: "distribution",
  id: "listening-share",
  title: "Where the plays go",
  measure: {
    label: "Spotify plays",
    unit: "plays",
    periodStart: "2026-09-01",
    periodEnd: "2026-09-30",
    population: "Eight supplied tracks",
  },
  items: [
    {
      id: "glasshouse",
      label: "Glasshouse",
      value: 420000,
      evidenceIds: ["play-observations"],
    },
    {
      id: "low-tide",
      label: "Low Tide",
      value: 300000,
      evidenceIds: ["play-observations"],
    },
    {
      id: "after-hours",
      label: "After Hours",
      value: 160000,
      evidenceIds: ["play-observations"],
    },
    {
      id: "daybreak",
      label: "Daybreak",
      value: 60000,
      evidenceIds: ["play-observations"],
    },
    {
      id: "night-drive",
      label: "Night Drive",
      value: 30000,
      evidenceIds: ["play-observations"],
    },
    {
      id: "stillwater",
      label: "Stillwater",
      value: 15000,
      evidenceIds: ["play-observations"],
    },
    {
      id: "blue-hour",
      label: "Blue Hour",
      value: 10000,
      evidenceIds: ["play-observations"],
    },
    {
      id: "home",
      label: "Home",
      value: 5000,
      evidenceIds: ["play-observations"],
    },
  ],
  complete: true,
  totalCount: 8,
};

export const listeningScenario = createComposedScenario(
  "listening",
  "Listening patterns",
  "Is listening spread across these tracks, or concentrated in a few?",
  {
    schemaVersion: 1,
    id: "example-listening",
    revision: 2,
    title: "Listening patterns",
    description:
      "A distribution explains concentration without adding controls.",
    context: {
      workspaceId: "example-label",
      subject: {
        kind: "track-selection",
        id: "september-eight",
        label: "Eight tracks · September",
      },
    },
    components: [distribution],
    evidence: [
      {
        id: "play-observations",
        label: "September play observations",
        sourceLabel: "Synthetic dataset / eight-track selection",
        observedAt: "2026-10-16T12:00:00Z",
        kind: "submitted",
        status: "current",
        text: "SYNTHETIC EXAMPLE. Invented Spotify play counts for the same September 1–30, 2026 reporting window: Glasshouse 420,000; Low Tide 300,000; After Hours 160,000; Daybreak 60,000; Night Drive 30,000; Stillwater 15,000; Blue Hour 10,000; Home 5,000. Total 1,000,000 plays across all eight supplied tracks. This is a complete supplied selection, not a claim about any artist’s entire catalog. Play counts are not unique listeners and do not establish a cause or revenue.",
      },
    ],
    answer: {
      revision: 2,
      parts: [
        {
          type: "insight",
          id: "concentration",
          componentId: distribution.id,
          calculation: "top-share",
          count: 2,
        },
        {
          type: "representation",
          id: "distribution",
          componentId: distribution.id,
          benefit: "show-distribution",
        },
        {
          type: "markdown",
          id: "interpretation",
          text: "These counts show **how plays are distributed**. They don’t explain why those tracks lead or how many individual people listened.",
        },
        { type: "sources", id: "sources", evidenceIds: ["play-observations"] },
      ],
    },
    fallbackText: `Synthetic example. ${describeConcentration(distribution, 2)}\n${getRepresentationText(distribution)}\nCounts are plays, not unique listeners. Source: synthetic September play observations.`,
  },
);
