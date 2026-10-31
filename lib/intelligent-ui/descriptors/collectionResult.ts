import { z } from "zod";
import {
  identifierSchema as id,
  labelSchema as label,
} from "../contractValues";
import { descriptorSchema, objectRefSchema } from "./schemas";
import { objectRowId } from "./objectRowId";
import { objectRefKey } from "./objectRefKey";

export const collectionResultSchema = z
  .object({
    workspaceId: id,
    items: z.array(descriptorSchema).max(200),
    nextCursor: id.nullable(),
    hasMore: z.boolean(),
    knownTotal: z.number().int().nonnegative().safe().nullable(),
    completeness: z.enum(["complete", "partial"]),
    aggregationScope: z.enum(["page", "population"]),
    population: label,
    selection: z.array(objectRefSchema).max(8),
  })
  .strict()
  .superRefine((result, ctx) => {
    const invalid = (message: string) =>
      ctx.addIssue({ code: "custom", message });
    if (result.hasMore !== (result.nextCursor !== null))
      invalid("Cursor contradicts continuation");
    if (result.knownTotal !== null && result.knownTotal < result.items.length)
      invalid("Total smaller than page");
    if (
      result.completeness === "complete" &&
      (result.hasMore || result.knownTotal !== result.items.length)
    )
      invalid("Incomplete population");
    if (
      result.aggregationScope === "population" &&
      result.completeness !== "complete"
    )
      invalid("Page cannot become population");
    if (
      new Set(result.items.map((d) => objectRowId(d.ref))).size !==
      result.items.length
    )
      invalid("Ambiguous subject rows");
    for (const refs of [result.items.map((d) => d.ref), result.selection]) {
      if (
        refs.some((ref) => ref.workspaceId !== result.workspaceId) ||
        new Set(refs.map(objectRefKey)).size !== refs.length
      )
        invalid("Unavailable references");
    }
  });
export type CollectionResult = z.infer<typeof collectionResultSchema>;
