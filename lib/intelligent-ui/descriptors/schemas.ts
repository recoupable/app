import { z } from "zod";
import { objectRowId } from "./objectRowId";
import {
  identifierSchema as id,
  labelSchema as label,
} from "../contractValues";

const versions = z
  .array(id)
  .min(1)
  .max(32)
  .refine((v) => new Set(v).size === v.length);
/** UI references preserve owning identities; they neither resolve names nor authorize reads. */
export const objectRefSchema = z
  .object({
    workspaceId: id,
    kind: z.enum([
      "recording",
      "composition",
      "release",
      "release_edition",
      "company",
      "statement",
      "purchase",
    ]),
    authority: z.enum(["context", "fixture"]),
    id,
    sourceVersionIds: versions,
  })
  .strict()
  .superRefine((ref, ctx) => {
    if (
      objectRowId(ref).length > 128 ||
      ref.sourceVersionIds.join(", ").length > 2000
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Reference exceeds renderer bounds",
      });
    }
    if (ref.authority !== "context") return;
    if (
      ![ref.workspaceId, ref.id, ...ref.sourceVersionIds].every(
        (v) => z.string().uuid().safeParse(v).success,
      ) ||
      ["release_edition", "statement", "purchase"].includes(ref.kind)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Unsupported Context reference",
      });
    }
  });
export const fieldValueSchema = z.discriminatedUnion("state", [
  z.object({ state: z.literal("known"), amount: z.number().finite() }).strict(),
  z
    .object({ state: z.enum(["unknown", "withheld", "not-applicable"]) })
    .strict(),
]);
export const descriptorSchema = z
  .object({
    ref: objectRefSchema,
    label,
    field: z
      .object({
        value: fieldValueSchema,
        role: z.enum(["observed", "hypothetical"]),
        metric: id,
        unit: label.nullable(),
        currency: id.nullable(),
        periodStart: z.string().date().nullable(),
        periodEnd: z.string().date().nullable(),
        territory: label,
        basis: label,
        observedAt: z.string().datetime({ offset: true }),
      })
      .strict(),
  })
  .strict();
export type ObjectRef = z.infer<typeof objectRefSchema>;
export type ObjectDescriptor = z.infer<typeof descriptorSchema>;
