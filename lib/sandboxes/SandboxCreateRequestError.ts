/**
 * Error thrown by `createSandbox` when `POST /api/sandbox` fails.
 * Carries the response status and any structured error payload
 * (`reason`, `actionUrl`) so the UI can render a useful message
 * (e.g. "Reconnect GitHub" with a deep link) instead of a generic
 * "request failed".
 *
 * Ported from open-agents
 * `apps/web/lib/sandbox/sandbox-create-request-error.ts`.
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
