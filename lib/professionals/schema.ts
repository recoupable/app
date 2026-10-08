import { z } from "zod";
export const professionalSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  name: z.string(),
  roles: z.array(z.enum(["songwriter", "producer"])),
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
export const pendingProfessionalSchema = z.object({
  organization_id: z.string().uuid(),
  idempotency_key: z.string().uuid(),
  mode: z.enum(["new", "existing"]),
  name: z.string().optional(),
  professional_id: z.string().uuid().optional(),
  roles: z.array(z.enum(["songwriter", "producer"])).min(1),
  roster_intent: z.literal("add"),
  confirmed: z.literal(true),
});
export type Professional = z.infer<typeof professionalSchema>;
export type ProfessionalRequest = z.infer<typeof pendingProfessionalSchema>;
