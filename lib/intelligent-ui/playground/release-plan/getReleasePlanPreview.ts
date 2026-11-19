import { ZodError } from "zod";
import { resolveReleasePlan } from "./resolveReleasePlan";
import type { ReleasePlanEdits, ResolvedPlan } from "./types";

export function getReleasePlanPreview(edits: ReleasePlanEdits): {
  resolved: ResolvedPlan | null;
  error: string;
} {
  try {
    return { resolved: resolveReleasePlan(edits), error: "" };
  } catch (reason) {
    const error =
      reason instanceof ZodError
        ? reason.issues.map((issue) => issue.message).join(" ")
        : reason instanceof Error
          ? reason.message
          : "Check your plan values.";
    return { resolved: null, error };
  }
}
