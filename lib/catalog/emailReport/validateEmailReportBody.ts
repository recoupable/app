import { z } from "zod";

const emailReportBodySchema = z.object({
  email: z.string().trim().email().max(320),
  headline_value: z.number().finite().positive().optional(),
});

export type EmailReportBody = z.infer<typeof emailReportBodySchema>;

/**
 * Validates the anonymous "Email me this report" body (chat#1902 item C3).
 * The endpoint is unauthenticated, so nothing beyond the viewer's own email
 * and an optional headline number is accepted.
 */
export function validateEmailReportBody(
  body: unknown,
): { data: EmailReportBody; error?: undefined } | { data?: undefined; error: string } {
  const result = emailReportBodySchema.safeParse(body);
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid body" };
  }
  return { data: result.data };
}
