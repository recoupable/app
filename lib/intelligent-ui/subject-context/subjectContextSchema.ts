import { z } from "zod";
import { identifierSchema, revisionSchema } from "../contractValues";
import { objectRefSchema } from "../descriptors/schemas";

/** Compact local projection; source versions remain attached to their owning refs. */
export const subjectContextSchema = z
  .object({
    workspaceId: identifierSchema,
    surfaceId: identifierSchema,
    revision: revisionSchema,
    subject: objectRefSchema,
    purpose: identifierSchema,
    selection: z.array(objectRefSchema).max(8),
  })
  .strict();

export type SubjectContext = z.infer<typeof subjectContextSchema>;
