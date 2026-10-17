import type { Surface } from "../schema";
import type {
  PresentationDecision,
  PresentationIntent,
  RepresentationCapabilities,
} from "./types";

/** A declared task benefit requests a representation; record count never does. */
export function selectPresentation(
  surface: Surface,
  intent: PresentationIntent,
  host: RepresentationCapabilities,
): PresentationDecision {
  if (intent.kind === "text")
    return { mode: "text", reason: "text-sufficient" };
  if (intent.kind !== "representation")
    return { mode: "text", reason: "unsupported-intent" };
  if (
    intent.benefit !== "show-distribution" &&
    intent.benefit !== "navigate-time"
  )
    return { mode: "text", reason: "benefit-mismatch" };
  const component = surface.components.find(
    (item) => item.id === intent.componentId,
  );
  if (
    !component ||
    (component.type !== "distribution" && component.type !== "timeline")
  )
    return { mode: "text", reason: "representation-unavailable" };
  if (
    (intent.benefit === "show-distribution" &&
      component.type !== "distribution") ||
    (intent.benefit === "navigate-time" && component.type !== "timeline")
  )
    return { mode: "text", reason: "benefit-mismatch" };
  if (!host[component.type])
    return { mode: "text", reason: "unsupported-host" };
  return component.type === "distribution"
    ? { mode: "visual", component, reason: "show-distribution" }
    : { mode: "visual", component, reason: "navigate-time" };
}
