import type { Surface } from "../schema";
import { computeDistribution } from "../representations/computeDistribution";
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
    intent.benefit !== "navigate-time" &&
    intent.benefit !== "select-records"
  )
    return { mode: "text", reason: "benefit-mismatch" };
  const component = surface.components.find(
    (item) => item.id === intent.componentId,
  );
  if (
    !component ||
    (component.type !== "distribution" &&
      component.type !== "timeline" &&
      component.type !== "collection")
  )
    return { mode: "text", reason: "representation-unavailable" };
  if (
    (intent.benefit === "show-distribution" &&
      component.type !== "distribution") ||
    (intent.benefit === "navigate-time" && component.type !== "timeline") ||
    (intent.benefit === "select-records" && component.type !== "collection")
  )
    return { mode: "text", reason: "benefit-mismatch" };
  if (!host[component.type])
    return { mode: "text", reason: "unsupported-host" };
  if (
    component.type === "distribution" &&
    computeDistribution(component).total === 0
  )
    return { mode: "text", reason: "zero-total" };
  if (component.type === "collection")
    return { mode: "visual", component, reason: "select-records" };
  return component.type === "distribution"
    ? { mode: "visual", component, reason: "show-distribution" }
    : { mode: "visual", component, reason: "navigate-time" };
}
