import {
  surfaceEventSchema,
  surfaceSchema,
  type Surface,
  type SurfaceEvent,
} from "./schema";

/** Apply one event atomically; the validated prior revision remains usable on failure. */
export function applySurfaceEvent(
  current: Surface | null,
  input: SurfaceEvent,
): Surface {
  const event = surfaceEventSchema.parse(input);
  if (event.type === "surface.snapshot") {
    if (current)
      throw new Error(
        "A surface snapshot is only allowed before initialization",
      );
    return event.surface;
  }
  if (!current)
    throw new Error("A surface snapshot is required before other events");
  const previous = surfaceSchema.parse(current);
  if (event.surfaceId !== previous.id)
    throw new Error("Event targets a different surface");
  if (event.type === "surface.complete") {
    if (event.revision !== previous.revision)
      throw new Error("Completion revision is stale");
    return current;
  }
  if (
    event.baseRevision !== previous.revision ||
    event.revision !== previous.revision + 1
  ) {
    throw new Error(
      "Patch must advance the current surface revision by exactly one",
    );
  }
  if (previous.answer && !event.answer)
    throw new Error("A patch to an answered surface requires a fresh answer");
  const components = new Map(
    previous.components.map((component) => [component.id, component]),
  );
  for (const id of event.remove) {
    if (!components.delete(id))
      throw new Error("Cannot remove an unknown component");
  }
  for (const component of event.upsert) components.set(component.id, component);
  // Evidence replacement and component edits are one transaction: validating
  // only the patch would miss orphan references in components retained here.
  return surfaceSchema.parse({
    ...previous,
    revision: event.revision,
    components: [...components.values()],
    evidence: event.evidence ?? previous.evidence,
    fallbackText: event.fallbackText ?? previous.fallbackText,
    answer: event.answer ?? previous.answer,
  });
}
