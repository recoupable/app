import type { TimelineComponent } from "../representations/schemas";
import { getRepresentationText } from "../representations/getRepresentationText";
import { createComposedScenario } from "./createComposedScenario";

const timeline: TimelineComponent = {
  type: "timeline",
  id: "section-study",
  title: "A small change, a bigger chorus",
  durationSeconds: 48,
  media: {
    kind: "audio",
    assetId: "section-study-v1",
    label: "Original instrumental demo · 48 seconds",
  },
  sections: [
    {
      id: "intro",
      label: "Intro",
      start: 0,
      end: 8,
      description:
        "A soft chord bed and a short, repeating motif introduce the musical idea. There is no drum pattern yet, leaving room for the arrangement to grow.",
      evidenceIds: ["section-notes"],
    },
    {
      id: "verse",
      label: "Verse",
      start: 8,
      end: 20,
      description:
        "The motif stays familiar while a low bass pulse and a restrained beat add movement. The change comes from the supporting layers, rather than a new melody.",
      evidenceIds: ["section-notes"],
    },
    {
      id: "lift",
      label: "Lift",
      start: 20,
      end: 28,
      description:
        "Higher notes and a more frequent pulse add energy. This short passage prepares the fuller texture that follows.",
      evidenceIds: ["section-notes"],
    },
    {
      id: "chorus",
      label: "Chorus",
      start: 28,
      end: 40,
      description:
        "The motif moves up an octave and the rhythm fills out. Compare this section with the intro: the same idea feels larger because more layers support it.",
      evidenceIds: ["section-notes"],
    },
    {
      id: "outro",
      label: "Outro",
      start: 40,
      end: 48,
      description:
        "The drums fall away and the original motif returns. A gradual fade gives the study a quiet landing.",
      evidenceIds: ["section-notes"],
    },
  ],
};

export const songScenario = createComposedScenario(
  "song",
  "Explore a song",
  "Help me hear how the arrangement changes from the intro to the chorus.",
  {
    schemaVersion: 1,
    id: "example-song",
    revision: 2,
    title: "An arrangement, explained",
    description: "Original instrumental fixture with authored section notes.",
    context: {
      workspaceId: "example-studio",
      subject: {
        kind: "audio-study",
        id: "section-study-v1",
        label: "Original section study",
      },
    },
    components: [timeline],
    evidence: [
      {
        id: "section-notes",
        label: "Original audio & section notes",
        sourceLabel: "Original synthetic instrumental / authored arrangement",
        observedAt: "2026-10-16T12:00:00Z",
        kind: "submitted",
        status: "current",
        text: "SYNTHETIC EXAMPLE. Original 48-second instrumental generated locally for this prototype. Its five authored sections are Intro 0–8s, Verse 8–20s, Lift 20–28s, Chorus 28–40s and Outro 40–48s. The intro uses a soft chord bed and repeating motif. The verse adds bass and restrained drums; the lift adds higher notes and more pulse; the chorus raises the motif one octave and adds rhythmic layers; the outro removes drums and fades. These descriptions document the authored arrangement. No model analyzed an uploaded recording, and the section labels do not describe a customer’s music.",
      },
    ],
    answer: {
      revision: 2,
      parts: [
        {
          type: "markdown",
          id: "introduction",
          text: "The chorus grows out of the intro’s motif. **Listen for the extra layers and the higher melody.** You can jump between sections to hear what changes.",
        },
        {
          type: "representation",
          id: "explorer",
          componentId: timeline.id,
          benefit: "navigate-time",
        },
        {
          type: "markdown",
          id: "continuation",
          text: "Here, the contrast comes from **register, rhythm and density**. The motif stays familiar as the arrangement changes around it.",
        },
        { type: "sources", id: "sources", evidenceIds: ["section-notes"] },
      ],
    },
    fallbackText: `Synthetic original instrumental with authored notes.\n${getRepresentationText(timeline)}\nThe notes describe the authored arrangement; no customer audio was analyzed.`,
  },
);
