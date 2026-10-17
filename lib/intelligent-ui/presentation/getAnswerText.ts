import type { Surface } from "../schema";
import { describeConcentration } from "../representations/describeConcentration";
import { getRepresentationText } from "../representations/getRepresentationText";

/** Derive export/fallback from the accepted response, never an older text copy. */
export function getAnswerText(surface: Surface): string {
  if (!surface.answer) return surface.fallbackText;
  return surface.answer.parts
    .map((part) => {
      if (part.type === "markdown") return part.text;
      if (part.type === "sources")
        return part.evidenceIds
          .map((id) => {
            const source = surface.evidence.find((item) => item.id === id);
            return source
              ? `${source.label} · ${source.sourceLabel} · ${source.observedAt} · ${source.status}${source.href ? ` · ${source.href}` : ""}`
              : "";
          })
          .join("\n");
      const component = surface.components.find(
        (item) => item.id === part.componentId,
      );
      if (part.type === "insight")
        return component?.type === "distribution"
          ? describeConcentration(component, part.count)
          : "";
      return component &&
        (component.type === "distribution" || component.type === "timeline")
        ? getRepresentationText(component)
        : "";
    })
    .filter(Boolean)
    .join("\n\n");
}
