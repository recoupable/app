import { useEffect, useRef } from "react";
import type { UIMessage } from "ai";
import { usePrivy } from "@privy-io/react-auth";
import { useUserProvider } from "@/providers/UserProvder";
import { generateUUID } from "@/lib/generateUUID";
import { getInitialMessageText } from "@/lib/chat/getInitialMessageText";
import { shouldAutoSendInitialMessage } from "@/lib/chat/shouldAutoSendInitialMessage";

interface UseInitialMessageAutoSendParams {
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
}

/**
 * The whole ?q= deep-link behavior, self-contained so useVercelChat
 * stays closed against changes here (OCP — this hook is the extension
 * point, like useChatTransport / usePersistSelectedModel). Auth state
 * is sourced from usePrivy/useUserProvider directly; params carry only
 * what is chat-instance-scoped.
 *
 * 1. Prefills the input with the prompt immediately — instant feedback
 *    that the AGENTS click landed while the workspace provisions.
 * 2. Auto-fires once provisioning lands (chat#1847: sending earlier
 *    POSTs /api/chat without a sessionId and 400s), sending whatever is
 *    in the input at that moment — an edit made while waiting sends the
 *    edited text, a cleared input sends nothing — exactly like
 *    pressing Send. One-shot refs guard re-prefill and double-sends.
 */
export function useInitialMessageAutoSend({
  initialMessages,
  status,
  messagesLength,
  sessionId,
  input,
  setInput,
  send,
}: UseInitialMessageAutoSendParams): void {
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
    const mayAutoSend = shouldAutoSendInitialMessage({
      hasInitialMessages: Boolean(initialMessageText),
      status,
      messagesLength,
      userId,
      authenticated,
      sessionId,
    });
    if (!mayAutoSend || didAutoFireRef.current) return;
    didAutoFireRef.current = true;
    const text = input.trim() ? input : "";
    if (!text) return;
    send({ id: generateUUID(), role: "user", parts: [{ type: "text", text }] });
    setInput("");
  }, [
    initialMessageText,
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
