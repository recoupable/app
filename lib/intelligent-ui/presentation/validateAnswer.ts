import type { RefinementCtx } from "zod";
import type { SurfaceComponent } from "../schema";
import { validateUniqueIds } from "../validateUniqueIds";
import type { ComposedAnswer } from "./answerSchema";

export function validateAnswer(
  surface: {
    revision: number;
    answer?: ComposedAnswer;
    components: SurfaceComponent[];
    evidence: { id: string }[];
  },
  ctx: RefinementCtx,
) {
  const answer = surface.answer;
  if (!answer) return;
  if (answer.revision !== surface.revision)
    ctx.addIssue({
      code: "custom",
      path: ["answer", "revision"],
      message: "Answer and data must have the same revision",
    });
  validateUniqueIds(
    answer.parts.map((part) => part.id),
    ctx,
    ["answer", "parts"],
  );
  const representations = new Set<string>();
  const sources = new Set(surface.evidence.map((source) => source.id));
  answer.parts.forEach((part, index) => {
    const path = ["answer", "parts", index];
    if (part.type === "representation") {
      if (representations.has(part.componentId))
        ctx.addIssue({
          code: "custom",
          path: [...path, "componentId"],
          message: `Duplicate representation: ${part.componentId}`,
        });
      representations.add(part.componentId);
    }
    if (part.type === "sources") {
      part.evidenceIds.forEach((id) => {
        if (!sources.has(id))
          ctx.addIssue({
            code: "custom",
            path,
            message: "Answer references an unknown source",
          });
      });
    }
    if (part.type !== "representation" && part.type !== "insight") return;
    const component = surface.components.find(
      (item) => item.id === part.componentId,
    );
    if (
      !component ||
      (component.type !== "distribution" && component.type !== "timeline")
    ) {
      ctx.addIssue({
        code: "custom",
        path,
        message: "Answer references an unavailable representation",
      });
      return;
    }
    if (
      part.type === "insight" &&
      (component.type !== "distribution" || part.count > component.items.length)
    )
      ctx.addIssue({
        code: "custom",
        path,
        message: "Calculation is incompatible with its input",
      });
    if (
      part.type === "representation" &&
      ((part.benefit === "show-distribution" &&
        component.type !== "distribution") ||
        (part.benefit === "navigate-time" && component.type !== "timeline"))
    )
      ctx.addIssue({
        code: "custom",
        path,
        message: "Presentation benefit is incompatible with the representation",
      });
  });
}
