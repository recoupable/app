import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import { getOptionalString } from "@/lib/string/getOptionalString";
import { SandboxCreateRequestError } from "./SandboxCreateRequestError";
import { getFallbackSandboxCreateErrorMessage } from "./getFallbackSandboxCreateErrorMessage";
import { parseCreateSandboxErrorResponse } from "./parseCreateSandboxErrorResponse";

/**
 * Sandbox row shape used by the listing UI (`useSandboxes`,
 * `SandboxList`, `SandboxListCard`). Kept here for backwards-compat
 * with the existing 4 callers that import `type { Sandbox }` from
 * this file.
 */
export interface Sandbox {
  sandboxId: string;
  sandboxStatus: "pending" | "running" | "stopping" | "stopped" | "failed";
  timeout: number;
  createdAt: string;
  runId?: string;
}

/**
 * Newly-provisioned sandbox response from `POST /api/sandbox`. Matches
 * open-agents' `SandboxInfo & { type }` shape so chat.recoupable.com
 * and sandbox.recoupable.com can both pass the result into
 * `runAgentWorkflow`'s `agentContext.sandbox`.
 */
export interface CreateSandboxResponse {
  type: string;
  createdAt: number;
  timeout: number | null;
  currentBranch?: string;
}

/**
 * Provision a sandbox for the given session via `POST /api/sandbox`
 * on recoup-api. Ported from open-agents
 * `apps/web/lib/sandbox/create-sandbox.ts` (DRY) so chat.recoupable.com
 * and sandbox.recoupable.com use the same provisioning path.
 *
 * recoup-api owns the sandbox lifecycle (provisioning, lifecycle
 * workflow, snapshot lookup, global-skill install) so the sandbox is
 * born in recoup-api's Vercel project and the chat workflow's
 * `sandbox.exec` calls — which also resolve via recoup-api's OIDC —
 * can reach it without any cross-project credential plumbing.
 *
 * @param cloneUrl - Repo URL to clone into the sandbox. Read off
 *   `session.cloneUrl` returned by `createSession` (api owns URL
 *   construction via `ensurePersonalRepo`).
 * @param sessionId - Session UUID created via `createSession`.
 * @param recoupAccessToken - Short-lived Privy JWT. Forwarded as
 *   `Authorization: Bearer …` so recoup-api's `validateAuthContext`
 *   accepts the cross-origin request.
 */
export async function createSandbox(
  cloneUrl: string,
  sessionId: string,
  recoupAccessToken: string | null,
): Promise<CreateSandboxResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (recoupAccessToken) {
    headers.Authorization = `Bearer ${recoupAccessToken}`;
  }

  const response = await fetch(`${getClientApiBaseUrl()}/api/sandbox`, {
    method: "POST",
    headers,
    body: JSON.stringify({ repoUrl: cloneUrl, sessionId }),
  });

  if (!response.ok) {
    const rawBody = await response.text().catch(() => "");
    const payload = parseCreateSandboxErrorResponse(rawBody);
    const message =
      getOptionalString(payload?.error) ??
      getFallbackSandboxCreateErrorMessage(response.status);

    throw new SandboxCreateRequestError(message, {
      status: response.status,
      reason: getOptionalString(payload?.reason),
      actionUrl: getOptionalString(payload?.actionUrl),
      responseBody: rawBody || undefined,
    });
  }

  const data = (await response.json()) as {
    mode: string;
    createdAt: number;
    timeout: number | null;
    currentBranch?: string;
  };

  return { ...data, type: data.mode };
}
