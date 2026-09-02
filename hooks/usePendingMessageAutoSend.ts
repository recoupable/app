import { useEffect, useRef } from "react";
import type { UIMessage } from "ai";
import { usePrivy } from "@privy-io/react-auth";
import { useUserProvider } from "@/providers/UserProvder";
import { generateUUID } from "@/lib/generateUUID";
import { getInitialMessageText } from "@/lib/chat/getInitialMessageText";
import { shouldSendPendingMessage } from "@/lib/chat/shouldSendPendingMessage";

interface UsePendingMessageAutoSendParams {
  /** The ?q= deep-link message from /chat?q=… (AGENTS cards). */
  initialMessages?: UIMessage[];
  /** useChat transport status — only "ready" may send. */
  status: string;
  messagesLength: number;
  /** Api-minted session id; absent until the bootstrap provisions. */
  sessionId?: string;
  input: string;
  setInput: (value: string) => void;
  /** The programmatic send path (handleSendQueryMessages). */
  send: (message: UIMessage) => void;
  /**
   * The person pressed Send while the workspace was still provisioning. Same
   * situation as a `?q=` prefill — text waiting on the workspace — so it rides
   * the same auto-fire rather than a second queue (recoupable/app#2052).
   */
  armed?: boolean;
  /** Called once the armed send has gone, so the caller can disarm. */
  onArmedSent?: () => void;
}

/**
 * Everything that waits on the workspace before sending, self-contained so useVercelChat
 * stays closed against changes here (OCP — this hook is the extension
 * point, like useChatTransport / usePersistSelectedModel). Auth state
 * is sourced from usePrivy/useUserProvider directly; params carry only
 * what is chat-instance-scoped.
 *
 * Two entry points, one mechanism: a `?q=` deep link, and a Send pressed
 * before the workspace was ready. **The input is the queue** — no separate
 * copy of the text — so an edit made while waiting sends the edited text and a
 * cleared input sends nothing, exactly like pressing Send.
 *
 * 1. Prefills the input with the prompt immediately — instant feedback
 *    that the AGENTS click landed while the workspace provisions.
 * 2. Auto-fires once provisioning lands (chat#1847: sending earlier
 *    POSTs /api/chat without a sessionId and 400s), sending whatever is
 *    in the input at that moment — an edit made while waiting sends the
 *    edited text, a cleared input sends nothing — exactly like
 *    pressing Send. One-shot refs guard re-prefill and double-sends.
 */
export function usePendingMessageAutoSend({
  initialMessages,
  status,
  messagesLength,
  sessionId,
  input,
  setInput,
  send,
  armed = false,
  onArmedSent,
}: UsePendingMessageAutoSendParams): void {
  const { authenticated } = usePrivy();
  const { userData } = useUserProvider();
  const userId = userData?.account_id || userData?.id;

  const initialMessageText = getInitialMessageText(initialMessages);
  const didPrefillRef = useRef(false);
  const didAutoFireRef = useRef(false);

  useEffect(() => {
    if (!initialMessageText || didPrefillRef.current) return;
    if (messagesLength > 0 || input) return;
    didPrefillRef.current = true;
    setInput(initialMessageText);
  }, [initialMessageText, messagesLength, input, setInput]);

  useEffect(() => {
    const mayAutoSend = shouldSendPendingMessage({
      hasPendingMessage: Boolean(initialMessageText) || armed,
      status,
      messagesLength,
      userId,
      authenticated,
      sessionId,
    });
    if (!mayAutoSend || didAutoFireRef.current) return;
    const text = input.trim() ? input : "";
    if (!text) {
      // Nothing to send: disarm so a later Send is not swallowed by the
      // one-shot guard.
      if (armed) onArmedSent?.();
      return;
    }
    didAutoFireRef.current = true;
    send({ id: generateUUID(), role: "user", parts: [{ type: "text", text }] });
    setInput("");
    if (armed) onArmedSent?.();
  }, [
    initialMessageText,
    armed,
    onArmedSent,
    status,
    messagesLength,
    userId,
    authenticated,
    sessionId,
    input,
    setInput,
    send,
  ]);
}
