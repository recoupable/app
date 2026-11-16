import type { AssessmentInputManifest } from "@/lib/releases/assessmentTypes";
import { z } from "zod";

export const assessmentManifestSchema: z.ZodType<AssessmentInputManifest> =
  z.object({
    compilerVersion: z.string(),
    method: z.string(),
    requestIds: z.array(z.string()),
    excludedTopics: z.array(z.string()),
    documents: z.array(
      z.object({
        documentId: z.string(),
        resultId: z.string().nullable(),
        subjectId: z.string(),
        topic: z.string(),
        version: z.number().int().positive(),
        sourceVersionIds: z.array(z.string()),
      }),
    ),
  });
