import { useState, useCallback } from "react";
import { TextAttachment } from "@/types/textAttachment";

/**
 * Hook for managing text file attachments (CSV, Markdown) in chat.
 * Text files are stored in memory and injected into messages at send time.
 */
export function useTextAttachments() {
  const [textAttachments, setTextAttachments] = useState<TextAttachment[]>([]);

  const addTextAttachment = useCallback(
    async (file: File, type: TextAttachment["type"]) => {
      const content = await file.text();
      const lineCount = content.split("\n").length;
      setTextAttachments((prev) => [
        ...prev,
        { filename: file.name, content, lineCount, type },
      ]);
    },
    []
  );

  const removeTextAttachment = useCallback((indexToRemove: number) => {
    setTextAttachments((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  }, []);

  const clearTextAttachments = useCallback(() => {
    setTextAttachments([]);
  }, []);

  return {
    textAttachments,
    setTextAttachments,
    addTextAttachment,
    removeTextAttachment,
    clearTextAttachments,
  };
}
