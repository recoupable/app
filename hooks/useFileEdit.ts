import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useUpdateFile } from "@/hooks/useUpdateFile";
import { getContentSizeBytes } from "@/utils/getContentSizeBytes";
import { MAX_TEXT_FILE_SIZE_BYTES } from "@/lib/consts/fileConstants";

type UseFileEditParams = {
  content: string | null;
  storageKey: string;
  mimeType: string | null;
  ownerAccountId: string;
  artistAccountId: string;
  isOpen: boolean;
};

/**
 * Hook to manage file editing state and operations
 *
 * @param root0
 * @param root0.content
 * @param root0.storageKey
 * @param root0.mimeType
 * @param root0.ownerAccountId
 * @param root0.artistAccountId
 * @param root0.isOpen
 */
export function useFileEdit({
  content,
  storageKey,
  mimeType,
  ownerAccountId,
  artistAccountId,
  isOpen,
}: UseFileEditParams) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");

  const { mutate: updateFile, isPending: isSaving } = useUpdateFile();

  // Check if content has unsaved changes
  const hasUnsavedChanges = isEditing && content !== editedContent && editedContent !== "";

  // Initialize edited content when content loads or editing starts
  useEffect(() => {
    if (content && isEditing && !editedContent) {
      setEditedContent(content);
    }
  }, [content, isEditing, editedContent]);

  // Reset editing state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      setEditedContent("");
    }
  }, [isOpen]);

  // Save handler
  const handleSave = useCallback(() => {
    if (!ownerAccountId || !artistAccountId) {
      toast.error("Missing account information");
      return;
    }

    // Validate file size (10MB limit for text files)
    const contentSize = getContentSizeBytes(editedContent);
    if (contentSize > MAX_TEXT_FILE_SIZE_BYTES) {
      toast.error(
        `File size exceeds 10MB limit. Current size: ${(contentSize / 1024 / 1024).toFixed(2)}MB`,
      );
      return;
    }

    updateFile(
      {
        storageKey,
        content: editedContent,
        mimeType: mimeType || "text/plain",
        ownerAccountId,
        artistAccountId,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          setEditedContent("");
        },
      },
    );
  }, [storageKey, editedContent, mimeType, ownerAccountId, artistAccountId, updateFile]);

  // Toggle edit mode with confirmation if there are unsaved changes
  const handleEditToggle = useCallback(
    (editing: boolean) => {
      // If canceling with unsaved changes, confirm first
      if (!editing && hasUnsavedChanges) {
        if (!window.confirm("You have unsaved changes. Are you sure you want to discard them?")) {
          return;
        }
      }

      if (editing && content) {
        setEditedContent(content);
      } else {
        setEditedContent("");
      }
      setIsEditing(editing);
    },
    [content, hasUnsavedChanges],
  );

  return {
    isEditing,
    editedContent,
    isSaving,
    hasUnsavedChanges,
    setEditedContent,
    handleSave,
    handleEditToggle,
  };
}
