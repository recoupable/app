import { z } from "zod";
import {
  evidenceIdsSchema,
  identifierSchema,
  labelSchema,
} from "../contractValues";

export const distributionSchema = z
  .object({
    type: z.literal("distribution"),
    id: identifierSchema,
    title: labelSchema,
    measure: z
      .object({
        label: labelSchema,
        unit: labelSchema,
        periodStart: z.string().date(),
        periodEnd: z.string().date(),
        population: labelSchema,
      })
      .strict(),
    items: z
      .array(
        z
          .object({
            id: identifierSchema,
            label: labelSchema,
            value: z.number().finite().nonnegative().max(1e12),
            evidenceIds: evidenceIdsSchema,
          })
          .strict(),
      )
      .min(1)
      .max(200),
    complete: z.boolean(),
    totalCount: z.number().int().nonnegative().max(1000000),
  })
  .strict();

export const timelineSchema = z
  .object({
    type: z.literal("timeline"),
    id: identifierSchema,
    title: labelSchema,
    durationSeconds: z.number().finite().positive().max(86400),
    media: z
      .object({
        kind: z.literal("audio"),
        assetId: identifierSchema,
        label: labelSchema,
      })
      .strict()
      .optional(),
    sections: z
      .array(
        z
          .object({
            id: identifierSchema,
            label: labelSchema,
            start: z.number().finite().nonnegative(),
            end: z.number().finite().positive(),
            description: z.string().min(1).max(2000),
            evidenceIds: evidenceIdsSchema,
          })
          .strict(),
      )
      .min(1)
      .max(50),
  })
  .strict();

export type DistributionComponent = z.infer<typeof distributionSchema>;
export type TimelineComponent = z.infer<typeof timelineSchema>;
export type Representation = DistributionComponent | TimelineComponent;
