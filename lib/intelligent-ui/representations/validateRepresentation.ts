import type { RefinementCtx } from "zod";
import { validateUniqueIds } from "../validateUniqueIds";
import type { Representation } from "./schemas";

export function validateRepresentation(
  component: Representation,
  ctx: RefinementCtx,
) {
  if (component.type === "distribution") {
    validateUniqueIds(
      component.items.map((item) => item.id),
      ctx,
      ["items"],
    );
    if (component.measure.periodEnd < component.measure.periodStart)
      ctx.addIssue({
        code: "custom",
        path: ["measure", "periodEnd"],
        message: "Reporting period ends before it starts",
      });
    if (
      component.totalCount < component.items.length ||
      (component.complete && component.totalCount !== component.items.length)
    )
      ctx.addIssue({
        code: "custom",
        path: ["totalCount"],
        message: "Distribution coverage contradicts supplied items",
      });
    return;
  }
  validateUniqueIds(
    component.sections.map((section) => section.id),
    ctx,
    ["sections"],
  );
  component.sections.forEach((section, index) => {
    if (
      section.start >= section.end ||
      section.end > component.durationSeconds ||
      (index > 0 && section.start < component.sections[index - 1].end)
    )
      ctx.addIssue({
        code: "custom",
        path: ["sections", index],
        message:
          "Intervals must be ordered, non-overlapping and within the duration",
      });
  });
}
