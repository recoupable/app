import { z } from "zod";
import {
  evidenceIdsSchema,
  identifierSchema,
  revisionSchema,
} from "../contractValues";

export const answerSchema = z
  .object({
    revision: revisionSchema,
    parts: z
      .array(
        z.discriminatedUnion("type", [
          z
            .object({
              type: z.literal("markdown"),
              id: identifierSchema,
              text: z.string().min(1).max(16000),
            })
            .strict(),
          z
            .object({
              type: z.literal("insight"),
              id: identifierSchema,
              componentId: identifierSchema,
              calculation: z.literal("top-share"),
              count: z.number().int().min(1).max(20),
            })
            .strict(),
          z
            .object({
              type: z.literal("representation"),
              id: identifierSchema,
              componentId: identifierSchema,
              benefit: z.enum(["show-distribution", "navigate-time"]),
            })
            .strict(),
          z
            .object({
              type: z.literal("sources"),
              id: identifierSchema,
              evidenceIds: evidenceIdsSchema.refine(
                (ids) => ids.length > 0,
                "A sources part requires at least one source",
              ),
            })
            .strict(),
        ]),
      )
      .min(1)
      .max(16),
  })
  .strict();

export type ComposedAnswer = z.infer<typeof answerSchema>;
export type AnswerPart = ComposedAnswer["parts"][number];
