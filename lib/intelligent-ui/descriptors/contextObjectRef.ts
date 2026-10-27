import { z } from "zod";
import { objectRefSchema, type ObjectRef } from "./schemas";

const inputSchema = z
  .object({
    ownerId: z.string().uuid(),
    subjectId: z.string().uuid(),
    kind: z.enum(["recording", "composition", "release", "company"]),
    identityConfirmed: z.literal(true),
    sourceVersionIds: z.array(z.string().uuid()).min(1).max(32),
  })
  .strict();

/** Projection of an already-authorized Context target plus document lineage; no lookup or identity inference. */
export function contextObjectRef(
  workspaceId: string,
  input: unknown,
): ObjectRef | null {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success || parsed.data.ownerId !== workspaceId) return null;
  const { subjectId, kind, sourceVersionIds } = parsed.data;
  const ref = objectRefSchema.safeParse({
    workspaceId,
    authority: "context",
    id: subjectId,
    kind,
    sourceVersionIds,
  });
  return ref.success ? ref.data : null;
}
