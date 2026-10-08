import { z } from "zod";
export const professionalSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  name: z.string(),
  roles: z
    .array(z.enum(["songwriter", "producer"]))
    .min(1)
    .max(2),
  confirmation_basis: z.literal("operator_confirmed"),
  created_at: z.string(),
});
export const professionalListSchema = z.object({
  professionals: z.array(professionalSchema),
  next_cursor: z.string().uuid().nullable(),
});
export const professionalResultSchema = z.object({
  professional: professionalSchema,
  created: z.boolean(),
});
export const pendingProfessionalSchema = z
  .object({
    organization_id: z.string().uuid(),
    idempotency_key: z.string().uuid(),
    mode: z.enum(["new", "existing"]),
    name: z.string().trim().min(2).max(200).optional(),
    professional_id: z.string().uuid().optional(),
    roles: z.array(z.enum(["songwriter", "producer"])).min(1),
    roster_intent: z.literal("add"),
    confirmed: z.literal(true),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.mode === "new" && (!value.name || value.professional_id))
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A new person requires a name without an existing ID",
      });
    if (value.mode === "existing" && (!value.professional_id || value.name))
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select an existing ID without renaming",
      });
  });
export type Professional = z.infer<typeof professionalSchema>;
export type ProfessionalRequest = z.infer<typeof pendingProfessionalSchema>;
