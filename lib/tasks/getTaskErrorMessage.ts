/**
 * The message a task mutation's toast should show: the API's own `error`
 * string when the client surfaced one (e.g. "Access denied to this task"),
 * otherwise the generic fallback. The task clients throw `HTTP <code>: <body>`
 * for non-2xx responses; the body's `error` field is what a person can act on.
 */
export function getTaskErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof Error) || !error.message) return fallback;
  const raw = error.message.replace(/^HTTP \d+:\s*/, "");
  try {
    const parsed = JSON.parse(raw) as { error?: unknown; message?: unknown };
    const fromBody = parsed.error ?? parsed.message;
    if (typeof fromBody === "string" && fromBody) return fromBody;
  } catch {
    // not a JSON body
  }
  return raw || fallback;
}
