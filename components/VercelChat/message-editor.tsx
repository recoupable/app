"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useDeleteTrailingMessages } from "@/hooks/useDeleteTrailingMessages";
import { EditingMessageProps } from "./EditingMessage";
import { useVercelChatContext } from "@/providers/VercelChatProvider";
import { TextUIPart, UIMessage } from "ai";
import { usePrivy } from "@privy-io/react-auth";
import { getChatMessages } from "@/lib/messages/getChatMessages";

export function MessageEditor({ message, setMode }: EditingMessageProps) {
  const {
    id,
    sessionId,
    messages,
    setMessages,
    reload,
    captureSendIntent,
    editUnacceptedMessage,
    isMessagePendingAdmission,
  } = useVercelChatContext();
  if (!id) {
    throw new Error("MessageEditor requires an active chat id");
  }
  const pendingAdmission = isMessagePendingAdmission?.(message.id) ?? false;
  const text = (message.parts[0] as TextUIPart)?.text || "";
  const [draftContent, setDraftContent] = useState<string>(text);
  const { getAccessToken } = usePrivy();
  const [editError, setEditError] = useState<string>();
  const [isCheckingHistory, setIsCheckingHistory] = useState(false);
  const [historyToReview, setHistoryToReview] = useState<{
    messages: UIMessage[];
    isCurrent: () => boolean;
    localHistory: string;
  }>();
  const originalHistory = useRef<UIMessage[]>([]);
  const pending = useRef(false);
  const mounted = useRef(true);
  const { deleteTrailingMessages, isDeletingTrailingMessages } =
    useDeleteTrailingMessages({});
  const busy = isDeletingTrailingMessages || isCheckingHistory;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  async function submitEdit() {
    if (pending.current || pendingAdmission) return;
    if (text === draftContent) {
      setMode("view");
      return;
    }
    if (editError) return;
    if (editUnacceptedMessage?.(message.id, draftContent)) {
      setMode("view");
      return;
    }
    const isCurrent = captureSendIntent?.() ?? (() => true);
    const canPublish = () => mounted.current && isCurrent();
    const submittedText = draftContent;
    originalHistory.current = messages;
    pending.current = true;
    try {
      await deleteTrailingMessages({
        chatId: id!,
        fromMessageId: message.id,
        isCurrent: canPublish,
      });
      if (!canPublish()) return;
      setMessages((current) => {
        const index = current.findIndex((m) => m.id === message.id);
        if (index === -1) return current;
        const updatedMessage: UIMessage = {
          ...message,
          parts: [{ type: "text", text: submittedText }],
        };
        return [...current.slice(0, index), updatedMessage];
      });
      setMode("view");
      reload();
    } catch {
      if (canPublish())
        setEditError(
          "We couldn’t confirm the edit. Your draft is kept. Check saved history before trying again.",
        );
    } finally {
      pending.current = false;
    }
  }

  async function checkSavedHistory() {
    if (pending.current || !sessionId) return;
    const isCurrent = captureSendIntent?.() ?? (() => true);
    const canPublish = () => mounted.current && isCurrent();
    pending.current = true;
    setIsCheckingHistory(true);
    try {
      const token = await getAccessToken();
      if (!canPublish()) return;
      if (!token) throw new Error("Missing access token");
      const saved = await getChatMessages(sessionId, id!, token);
      if (!canPublish()) return;
      // This read only checks for observed changes; it does not fence writers.
      if (JSON.stringify(saved) === JSON.stringify(originalHistory.current)) {
        setEditError(undefined);
        setHistoryToReview(undefined);
      } else {
        setHistoryToReview({
          messages: saved,
          isCurrent: canPublish,
          localHistory: JSON.stringify(originalHistory.current),
        });
        setEditError(
          "Saved history changed. Your draft is kept here. Copy it before cancelling to review the saved conversation.",
        );
      }
    } catch {
      if (canPublish())
        setEditError(
          "We couldn’t load saved history. Your draft is kept. Retry checking history.",
        );
    } finally {
      pending.current = false;
      if (mounted.current) setIsCheckingHistory(false);
    }
  }
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function adjustHeight() {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
    }
  }

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, []);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraftContent(event.target.value);
    adjustHeight();
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <Textarea
        data-testid="message-editor"
        ref={textareaRef}
        className="bg-transparent outline-none overflow-hidden resize-none !text-base rounded-xl w-full"
        aria-label="Edit message"
        disabled={busy || pendingAdmission}
        value={draftContent}
        onChange={handleInput}
      />

      {editError && (
        <div className="space-y-2">
          <p role="alert" className="text-sm">
            {editError}
          </p>
          {sessionId && (
            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => void checkSavedHistory()}
            >
              {isCheckingHistory ? "Checking history…" : "Check saved history"}
            </Button>
          )}
        </div>
      )}
      <div className="flex flex-row gap-2 justify-end">
        <Button
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => {
            if (historyToReview?.isCurrent())
              setMessages((current) =>
                historyToReview.isCurrent() &&
                JSON.stringify(current) === historyToReview.localHistory
                  ? historyToReview.messages
                  : current,
              );
            setMode("view");
          }}
          className="rounded-xl"
        >
          Cancel
        </Button>
        <Button
          data-testid="message-editor-send-button"
          variant="default"
          size="sm"
          disabled={
            busy || pendingAdmission || (!!editError && text !== draftContent)
          }
          onClick={() => void submitEdit()}
          className="rounded-xl"
        >
          {pendingAdmission
            ? "Confirming send…"
            : isDeletingTrailingMessages
              ? "Sending..."
              : "Send"}
        </Button>
      </div>
    </div>
  );
}
