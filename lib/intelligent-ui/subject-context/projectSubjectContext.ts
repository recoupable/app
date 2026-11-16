import { z } from "zod";
import { descriptorSchema } from "../descriptors/schemas";
import { indexDescriptors } from "../descriptors/indexDescriptors";
import { objectRefKey } from "../descriptors/objectRefKey";
import { objectRowId } from "../descriptors/objectRowId";
import { resolveSelection } from "../descriptors/resolveSelection";
import {
  subjectContextSchema,
  type SubjectContext,
} from "./subjectContextSchema";

const bindingKey = z.string().min(1).max(8192);
const proposalSchema = z
  .object({ bindingKey, context: subjectContextSchema })
  .strict();
const currentSchema = z
  .object({
    bindingKey,
    context: subjectContextSchema.omit({ selection: true }),
    descriptors: z.array(descriptorSchema).max(200),
  })
  .strict();
export type SubjectContextCurrent = z.infer<typeof currentSchema>;

/**
 * Validate a captured proposal against the host's current authorized descriptor set.
 * Pure local consistency only: no service authorization, lookup, send or persistence.
 */
export function projectSubjectContext(
  proposed: unknown,
  current: SubjectContextCurrent,
): { state: "available"; context: SubjectContext } | { state: "unavailable" } {
  const candidate = proposalSchema.safeParse(proposed);
  const live = currentSchema.safeParse(current);
  if (!candidate.success || !live.success) return { state: "unavailable" };
  const captured = candidate.data.context;
  const now = live.data.context;
  // Match CollectionResult's one-current-reference-per-object constraint.
  if (
    new Set(live.data.descriptors.map((item) => objectRowId(item.ref))).size !==
    live.data.descriptors.length
  )
    return { state: "unavailable" };
  if (
    candidate.data.bindingKey !== live.data.bindingKey ||
    captured.workspaceId !== now.workspaceId ||
    captured.surfaceId !== now.surfaceId ||
    captured.revision !== now.revision ||
    captured.purpose !== now.purpose ||
    objectRefKey(captured.subject) !== objectRefKey(now.subject)
  )
    return { state: "unavailable" };
  const available = indexDescriptors(live.data.descriptors);
  if (
    resolveSelection(now.workspaceId, available, [captured.subject]).state !==
      "available" ||
    resolveSelection(now.workspaceId, available, captured.selection).state !==
      "available"
  )
    return { state: "unavailable" };
  // Zod parsed detached, strictly allowlisted refs. Never copy labels, values or host keys.
  return { state: "available", context: captured };
}
