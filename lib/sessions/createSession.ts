import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

/**
 * Body accepted by recoup-api `POST /api/sessions`. Mirrors the
 * server-side Zod schema in `api/lib/sessions/validateCreateSessionBody.ts`.
 * Pass `organizationId` to scope the session to an org (api validates
 * org access and uses `recoupable/<organizationId>` as the workspace
 * repo); omit it for a personal session against `recoupable/<accountId>`.
 * The api derives `cloneUrl` server-side via `ensurePersonalRepo` — the
 * client must not construct GitHub URLs.
 */
export interface CreateSessionInput {
  title?: string;
  organizationId?: string;
  /** Persisted on `sessions.artist_id`; backs the sidebar's artist filter. */
  artistId?: string;
}

/**
 * Session + first-chat shape returned by `POST /api/sessions`. The
 * bootstrap reads `session.cloneUrl` to hand to `createSandbox` so
 * url construction stays server-side.
 */
export interface CreateSessionResponse {
  session: { id: string; cloneUrl: string };
  chat: { id: string };
}

interface CreateSessionErrorResponse {
  error?: string;
}

/**
 * Create a session row on recoup-api so the workflow transport has a
 * `sessionId` to attach the chat to. Mirrors the cutover that
 * sandbox.recoupable.com (open-agents) already made — both surfaces
 * use the same recoup-api `POST /api/sessions` so session ownership
 * lives in one place.
 *
 * @param input - Session metadata. Pass `organizationId` for org
 *   sessions; omit for personal. The api owns cloneUrl construction
 *   and returns it on `session.cloneUrl`.
 * @param recoupAccessToken - Short-lived Privy JWT, forwarded as
 *   `Authorization: Bearer …`.
 */
export async function createSession(
  input: CreateSessionInput,
  recoupAccessToken: string | null,
): Promise<CreateSessionResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (recoupAccessToken) {
    headers.Authorization = `Bearer ${recoupAccessToken}`;
  }

  const response = await fetch(`${getClientApiBaseUrl()}/api/sessions`, {
    method: "POST",
    headers,
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const rawBody = await response.text().catch(() => "");
    let parsed: CreateSessionErrorResponse | null = null;
    if (rawBody) {
      try {
        parsed = JSON.parse(rawBody) as CreateSessionErrorResponse;
      } catch {
        parsed = null;
      }
    }
    const message = parsed?.error ?? "Failed to create session";
    throw new Error(message);
  }

  return (await response.json()) as CreateSessionResponse;
}
