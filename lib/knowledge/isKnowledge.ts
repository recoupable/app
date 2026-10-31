import { z } from "zod";
import type { Knowledge } from "@/types/knowledge";

const knowledgeSchema: z.ZodType<Knowledge> = z.object({
  url: z.string(),
  name: z.string(),
  type: z.string(),
});

export function isKnowledge(value: unknown): value is Knowledge {
  return knowledgeSchema.safeParse(value).success;
}
