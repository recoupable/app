import { surfaceSchema, type Surface } from "../schema";
import type { PlaygroundScenario, ScenarioId } from "./scenarios";

export function createComposedScenario(
  id: ScenarioId,
  label: string,
  prompt: string,
  document: Surface,
): PlaygroundScenario {
  const complete = surfaceSchema.parse(document);
  if (!complete.answer || complete.revision !== 2)
    throw new Error("Composed fixtures require a revision-2 answer");
  const initial = surfaceSchema.parse({
    ...complete,
    revision: 0,
    components: [],
    answer: {
      revision: 0,
      parts: [
        {
          type: "markdown",
          id: "pending",
          text: "This replay is assembling the supplied example.",
        },
      ],
    },
    fallbackText:
      "Synthetic replay fixture: the supplied example is being assembled.",
  });
  return {
    id,
    label,
    category: "Answer composition",
    prompt,
    initial,
    events: [
      { type: "surface.snapshot", surface: initial },
      {
        type: "surface.patch",
        surfaceId: initial.id,
        baseRevision: 0,
        revision: 1,
        upsert: complete.components,
        remove: [],
        answer: { ...complete.answer, revision: 1 },
        fallbackText: complete.fallbackText,
      },
      {
        type: "surface.patch",
        surfaceId: initial.id,
        baseRevision: 1,
        revision: 2,
        upsert: [],
        remove: [],
        answer: complete.answer,
      },
      { type: "surface.complete", surfaceId: initial.id, revision: 2 },
    ],
  };
}
