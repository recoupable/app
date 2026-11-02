import { z } from "zod";
import { calendarDate } from "./calendarDate";

export const taskIds = ["artwork", "documentation", "review"] as const;
export const dateSchema = z
  .string()
  .refine((date) => calendarDate(date) !== null, {
    message: "Use a real calendar date from 1900 through 2100.",
  });
const zoneSchema = z
  .string()
  .max(100)
  .refine((zone) => {
    if (zone !== "UTC" && !/^[A-Za-z_]+\/[A-Za-z0-9_+\-/]+$/.test(zone))
      return false;
    try {
      new Intl.DateTimeFormat("en", { timeZone: zone });
      return true;
    } catch {
      return false;
    }
  }, "Enter an IANA timezone, such as America/New_York or UTC.");
const taskSchema = z
  .object({
    id: z.enum(taskIds),
    anchor: z.enum(["release", ...taskIds]),
    offsetDays: z.number().int().min(-365).max(365),
    manualDate: dateSchema.nullable(),
  })
  .strict();
export const releasePlanEditsSchema = z
  .object({
    goal: z.string().trim().min(1).max(240),
    releaseDate: dateSchema,
    timeZone: zoneSchema,
    tasks: z.array(taskSchema).length(taskIds.length),
  })
  .strict()
  .refine(
    (plan) =>
      new Set(plan.tasks.map((task) => task.id)).size === taskIds.length,
    "Each known task must appear exactly once.",
  );
export const releasePlanScopeSchema = z
  .object({
    authority: z.literal("fixture"),
    workspaceId: z.string().min(1).max(100),
    releaseId: z.string().min(1).max(100),
    sourceId: z.literal("delivery-sheet"),
    sourceRevision: z.literal(3),
    fixtureRevision: z.literal(1),
    purpose: z.literal("local-release-planning"),
  })
  .strict();
export const savedReleasePlanSchema = z
  .object({
    schemaVersion: z.literal(1),
    scope: releasePlanScopeSchema,
    version: z.number().int().min(1).max(1000),
    edits: releasePlanEditsSchema,
  })
  .strict();
export type ReleasePlanEdits = z.infer<typeof releasePlanEditsSchema>;
export type ReleasePlanScope = z.infer<typeof releasePlanScopeSchema>;
export type SavedReleasePlan = z.infer<typeof savedReleasePlanSchema>;
export type TaskId = (typeof taskIds)[number];
export type ReleasePlanFixture = {
  scope: ReleasePlanScope;
  label: string;
  sourceText: string;
  initial: ReleasePlanEdits;
};
export const taskLabels: Record<TaskId, string> = {
  artwork: "Collect After Hours artwork",
  documentation: "Confirm Daybreak contributors and check artwork",
  review: "Review Daybreak materials",
};
export type ResolvedTask = {
  id: TaskId;
  date: string;
  proposedDate: string;
  manual: boolean;
};
export type ResolvedPlan = {
  edits: ReleasePlanEdits;
  tasks: ResolvedTask[];
  conflicts: string[];
};
export type LocalPlanBase = {
  version: number;
  edits: ReleasePlanEdits;
  token: string | null;
};
export type PlanStorage = Pick<Storage, "getItem" | "setItem">;
