import type { UIMessage } from "ai";
import { WorkflowChatTransport } from "@workflow/ai";

interface CreateWorkflowChatTransportOptions {
  /** recoup-api origin, e.g. `https://api.recoupable.dev`. */
  baseUrl: string;
  /** Reads the ids current as of the request, not as of transport construction. */
  getIds: () => { sessionId: string | undefined; chatId: string };
  /** Privy access token for both the POST and every reconnect. */
  getAccessToken: () => Promise<string | null>;
  /**
   * Resolves once the sandbox can take a request; rejects if provisioning
   * failed. A Send pressed while provisioning is a real message from the
   * first frame, and the request itself waits here (app#2052).
   */
  waitForWorkspace?: () => Promise<void>;
}

/**
 * A chat transport that reconnects through a dropped stream on its own.
 *
 * `WorkflowChatTransport` is a single generator: it reads the POST stream,
 * and if that stream ends without a `finish` chunk it continues into
 * `while (!gotFinish)`, reissuing `GET {api}/…/stream?startIndex=N` with the
 * chunk index it has been counting all along. One continuous stream reaches
 * `useChat`, which therefore settles exactly when `finish` arrives.
 *
 * That structure is why we adopted it. Our hand-rolled equivalent tracked the
 * same state across React refs — an in-flight flag, an edge-detected trigger,
 * a probe schedule, a terminal-state branch — and each fix exposed another
 * unverified state: a trigger that fired once, a flag held across a 120s
 * connection, a final stream end that fired nothing. There is no trigger to
 * miss here, and no ref to hold (chat#1923).
 *
 * @param options - Api origin, live ids, and the token getter.
 * @returns A transport ready to hand to `useChat`.
 */
export function createWorkflowChatTransport<UI_MESSAGE extends UIMessage>({
  baseUrl,
  getIds,
  getAccessToken,
  waitForWorkspace,
}: CreateWorkflowChatTransportOptions): WorkflowChatTransport<UI_MESSAGE> {
  const authHeaders = async (): Promise<Record<string, string>> => {
    const token = await getAccessToken().catch(() => null);
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  class RecoupChatTransport extends WorkflowChatTransport<UI_MESSAGE> {
    /**
     * `204` is our api's "nothing to resume" answer, and it has no body — which
     * the transport surfaces as `Failed to fetch chat: 204` and counts toward
     * `maxConsecutiveErrors`. Treat it as the end of the road instead, matching
     * upstream open-agents' wrapper.
     */
    override async reconnectToStream(
      options: Parameters<
        WorkflowChatTransport<UI_MESSAGE>["reconnectToStream"]
      >[0],
    ) {
      try {
        return await super.reconnectToStream(options);
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.startsWith("Failed to fetch chat: 204")
        ) {
          return null;
        }
        throw error;
      }
    }
  }

  return new RecoupChatTransport({
    api: `${baseUrl}/api/chat`,
    prepareSendMessagesRequest: async ({ messages, body }) => {
      // Stop during the wait aborts the signal useChat hands to fetch, so an
      // abandoned send never reaches the api.
      await waitForWorkspace?.();
      const { sessionId, chatId } = getIds();
      const recoupAccessToken = await getAccessToken().catch(() => null);
      return {
        headers: await authHeaders(),
        body: {
          ...body,
          messages,
          sessionId,
          chatId,
          ...(recoupAccessToken ? { recoupAccessToken } : {}),
        },
      };
    },
    // The default reconnect path is keyed by workflow run id; ours is keyed by
    // chat id, and is authenticated like every other endpoint. `startIndex` is
    // appended by the transport from its own chunk count — never by us.
    prepareReconnectToStreamRequest: async () => ({
      api: `${baseUrl}/api/chat/${getIds().chatId}/stream`,
      headers: await authHeaders(),
    }),
  });
}
