import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

interface FetchChatIsStreamingOptions {
  sessionId: string;
  chatId: string;
  getAccessToken: () => Promise<string | null>;
}

/**
 * Ask the server whether a chat's response is still being generated.
 *
 * Reads `ChatSummary.isStreaming` from `GET /api/sessions/{sessionId}/chats`,
 * which the api already derives from `chats.active_stream_id` and which
 * carries no message bodies — the sibling single-chat read returns the whole
 * transcript and is the wrong thing to poll.
 *
 * This is the cheap question that lets stream recovery run on one trigger:
 * `resumeStream()` opens a stream, so it can never be the poll itself.
 *
 * @returns `true`/`false` from the server, or `null` when the probe itself
 *   failed — a distinction the caller needs, since an unanswered question is
 *   not the same as a "no".
 */
export async function fetchChatIsStreaming({
  sessionId,
  chatId,
  getAccessToken,
}: FetchChatIsStreamingOptions): Promise<boolean | null> {
  try {
    const token = await getAccessToken();
    const response = await fetch(
      `${getClientApiBaseUrl()}/api/sessions/${encodeURIComponent(sessionId)}/chats`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: "no-store",
      },
    );
    if (!response.ok) return null;

    const body: unknown = await response.json();
    const chats = (body as { chats?: { id?: string; isStreaming?: boolean }[] })?.chats;
    if (!Array.isArray(chats)) return null;

    return chats.some(chat => chat?.id === chatId && chat?.isStreaming === true);
  } catch {
    return null;
  }
}
