import { z } from "zod/v4";
import { contextRequestTargetSchema } from "./contextRequestTargetSchema";
const versions = z
  .array(z.uuid())
  .min(1)
  .max(32)
  .refine(ids => new Set(ids).size === ids.length);
export const selectedBriefEvidenceSchema = z
  .array(
    z.strictObject({
      documentId: z.uuid(),
      resultId: z.uuid().nullable(),
      subjectId: z.uuid(),
      topic: z.string().min(1).max(128),
      version: z.number(),
      sourceVersionIds: versions,
    }),
  )
  .min(1)
  .max(8)
  .refine(rows => new Set(rows.map(row => row.documentId)).size === rows.length);
export const briefEvidenceValidationSchema = z.discriminatedUnion("state", [
  z.strictObject({ state: z.literal("unavailable") }),
  z.strictObject({
    state: z.literal("available"),
    documents: z
      .array(
        z.strictObject({
          documentId: z.uuid(),
          subjectId: z.uuid(),
          kind: contextRequestTargetSchema.shape.kind,
          identityConfirmed: z.literal(true),
          sourceVersionIds: versions,
        }),
      )
      .min(1)
      .max(8),
  }),
]);
