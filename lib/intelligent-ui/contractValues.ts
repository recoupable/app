import { z } from "zod";
import { validateUniqueIds } from "./validateUniqueIds";

export const identifierSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(/^[A-Za-z0-9][A-Za-z0-9._:-]*$/);
export const labelSchema = z
  .string()
  .min(1)
  .max(160)
  .refine((value) => value.trim().length > 0, "Label must contain text");
export const revisionSchema = z
  .number()
  .int()
  .nonnegative()
  .max(Number.MAX_SAFE_INTEGER);
export const evidenceIdsSchema = z
  .array(identifierSchema)
  .max(32)
  .superRefine((ids, ctx) => validateUniqueIds(ids, ctx, []));
