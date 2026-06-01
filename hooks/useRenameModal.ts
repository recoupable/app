import { useState, useEffect, useCallback } from "react";
import type { Conversation } from "@/types/Chat";
import { usePrivy } from "@privy-io/react-auth";
import { updateChat } from "@/lib/chats/updateChat";
import { useConversationsProvider } from "@/providers/ConversationsProvider";

const validateName = (value: string): string => {
  const trimmed = value.trim();

  if (!trimmed) return "Chat name cannot be empty";
  if (trimmed.length < 3) return "Chat name must be at least 3 characters";
  if (trimmed.length > 50) return "Chat name cannot exceed 50 characters";
  if (/[<>{}]/g.test(trimmed)) return "Chat name contains invalid characters";

  return "";
};

type UseRenameModalParams = {
  isOpen: boolean;
  chatRoom: Conversation | null;
  onClose: () => void;
};

export function useRenameModal({
  isOpen,
  chatRoom,
  onClose,
}: UseRenameModalParams) {
  const { getAccessToken } = usePrivy();
  const { refetchConversations } = useConversationsProvider();

  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && chatRoom) {
      setName(chatRoom.topic);
      setError("");
      setTouched(false);
      setIsSubmitting(false);
    }
  }, [isOpen, chatRoom]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setIsSubmitting(false);
        setError("");
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setName(value);
      if (touched) setError(validateName(value));
    },
    [touched],
  );

  const handleBlur = useCallback(() => {
    setTouched(true);
    setError(validateName(name));
  }, [name]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const validationError = validateName(name);
      if (validationError) {
        setError(validationError);
        return;
      }

      const accessToken = await getAccessToken();
      if (!accessToken) {
        setError("Authentication required");
        return;
      }

      if (!chatRoom) return;

      setIsSubmitting(true);

      try {
        await updateChat({
          accessToken,
          sessionId: chatRoom.sessionId,
          chatId: chatRoom.id,
          title: name,
        });

        await refetchConversations();
        onClose();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to rename chat. Please try again.",
        );
        setIsSubmitting(false);
      }
    },
    [name, getAccessToken, chatRoom, refetchConversations, onClose],
  );

  const handleModalClose = useCallback(() => {
    if (!isSubmitting) {
      onClose();
    }
  }, [isSubmitting, onClose]);

  const isValid = !error && name.trim().length >= 3;

  return {
    name,
    error,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    handleModalClose,
  };
}
