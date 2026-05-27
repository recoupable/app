/**
 * Error thrown by `createSandbox` when `POST /api/sandbox` fails.
 * Carries the HTTP status and the structured error payload recoup-api
 * returns (`reason`, `actionUrl`) so the UI can render a useful
 * message (e.g. "Reconnect GitHub" with a deep link) instead of a
 * generic "request failed".
 *
 * Not duplicative of the `@vercel/sandbox` SDK's errors — that SDK
 * lives server-side inside recoup-api, where it provisions the
 * underlying Vercel sandbox. This class lives at the chat → recoup-api
 * HTTP boundary and represents the response shape recoup-api emits,
 * which intentionally surfaces actionable hints (`actionUrl`) that the
 * raw SDK error doesn't carry.
 */
export class SandboxCreateRequestError extends Error {
  readonly reason?: string;
  readonly actionUrl?: string;
  readonly status: number;
  readonly responseBody?: string;

  constructor(
    message: string,
    options: {
      status: number;
      reason?: string;
      actionUrl?: string;
      responseBody?: string;
    },
  ) {
    super(message);
    this.name = "SandboxCreateRequestError";
    this.reason = options.reason;
    this.actionUrl = options.actionUrl;
    this.status = options.status;
    this.responseBody = options.responseBody;
  }
}
