/**
 * Optional fields recoup-api may surface on a failed `POST /api/sandbox`
 * response body. All optional — older deployments only return `error`.
 */
export interface CreateSandboxErrorResponse {
  error?: string;
  reason?: string;
  actionUrl?: string;
}

/**
 * Parse a `POST /api/sandbox` error body without throwing. Returns
 * `null` when the body is empty, not valid JSON, or not a JSON object,
 * so callers can fall back to a status-derived message.
 */
export function parseCreateSandboxErrorResponse(
  rawBody: string,
): CreateSandboxErrorResponse | null {
  if (!rawBody) return null;
  try {
    const parsed = JSON.parse(rawBody) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as CreateSandboxErrorResponse;
  } catch {
    return null;
  }
}
