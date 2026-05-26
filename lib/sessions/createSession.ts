import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

/**
 * Body accepted by recoup-api `POST /api/sessions`. Mirrors the
 * server-side Zod schema in `api/lib/sessions/validateCreateSessionBody.ts`.
 * All fields are optional — pass `cloneUrl` so the session row records
 * which repo the sandbox will clone.
 */
export interface CreateSessionInput {
  title?: string;
  cloneUrl?: string;
  branch?: string;
  sandboxType?: "vercel";
}

/**
 * Session + first-chat shape returned by `POST /api/sessions`. We
 * intentionally type only the fields chat.recoupable.com reads at the
 * call site (the session id, plus the chat id we hand to the workflow
 * transport); the server returns a richer payload that we don't need
 * to model here.
 */
export interface CreateSessionResponse {
  session: { id: string };
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
 * @param input - Session metadata. Pass `cloneUrl` (built via
 *   `buildOrgRepoUrl` / `buildPersonalRepoUrl`) so the session row
 *   records which workspace repo this chat targets.
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
