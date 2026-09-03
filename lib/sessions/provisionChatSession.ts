import { createSession } from "@/lib/sessions/createSession";
import { createSandbox } from "@/lib/sandboxes/createSandbox";

export interface ProvisionChatSessionInput {
  /**
   * Account id of the artist this chat is being created under. Stamped on
   * `sessions.artist_id` server-side; backs the sidebar's artist filter.
   */
  artistId: string | undefined;
  /**
   * Organization id. Resolves the session's `cloneUrl` to the org-scoped
   * repo via `ensurePersonalRepo`. `undefined` provisions under the
   * caller's personal repo.
   */
  orgId: string | undefined;
}

export interface ProvisionChatSessionResult {
  sessionId: string;
  chatId: string;
}

/**
 * Full new-chat provisioning: `POST /api/sessions` (api derives
 * `cloneUrl` server-side via `ensurePersonalRepo`) followed by
 * `POST /api/sandbox` against the api-returned `cloneUrl`. Returns the
 * api-minted `sessionId` + `chatId` for the caller to mount `<Chat>`
 * against the rows recoup-api actually persisted.
 *
 * Both POSTs are side effects (no idempotency keys). Callers wrap this
 * in `useMutation` (see `useNewChatBootstrap`) so react-query handles
 * the in-flight / settled state and prevents incidental re-firing.
 */
export async function provisionChatSession(
  input: ProvisionChatSessionInput,
  accessToken: string,
  /**
   * Called with the ids the moment the session is minted, before the sandbox
   * is provisioned. The sandbox is the slow half — around 17 seconds measured
   * — and the chat exists for the whole of it, so the UI can navigate to the
   * real chat URL and show a sent message immediately rather than holding the
   * person on the home page (recoupable/app#2052).
   */
  onSessionCreated?: (ids: ProvisionChatSessionResult) => void,
): Promise<ProvisionChatSessionResult> {
  const { session, chat } = await createSession(
    { artistId: input.artistId, organizationId: input.orgId },
    accessToken,
  );
  const ids = { sessionId: session.id, chatId: chat.id };
  onSessionCreated?.(ids);

  await createSandbox(session.cloneUrl, session.id, accessToken);
  return ids;
}
