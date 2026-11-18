import { z } from "zod";
import { identifierSchema } from "../../contractValues";

export const creativeRefSchema = z
  .object({
    authority: z.literal("fixture"),
    assetId: identifierSchema,
    version: z.string().regex(/^[a-f0-9]{64}$/),
  })
  .strict();
export type CreativeRef = z.infer<typeof creativeRefSchema>;
export type CreativeAsset = {
  ref: CreativeRef;
  label: string;
  caption: string;
  provenance: string;
  status: "available" | "processing" | "unavailable" | "withdrawn";
  preview: "light-wordmark" | "dark-wordmark";
};
export const creativeDraftSchema = z
  .object({
    version: z.literal(1),
    selection: creativeRefSchema.nullable(),
    notes: z
      .array(
        z
          .object({ ref: creativeRefSchema, text: z.string().max(2000) })
          .strict(),
      )
      .max(8),
  })
  .strict();
export type CreativeDraft = z.infer<typeof creativeDraftSchema>;
