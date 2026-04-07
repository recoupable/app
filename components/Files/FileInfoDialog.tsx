"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import type { FileRow } from "@/components/Files/types";
import { useFileContent } from "@/hooks/useFileContent";
import { useFileEdit } from "@/hooks/useFileEdit";
import { useKeyboardSave } from "@/hooks/useKeyboardSave";
import { isTextFile } from "@/utils/isTextFile";
import { extractAccountIds } from "@/utils/extractAccountIds";
import FileInfoDialogHeader from "./FileInfoDialogHeader";
import FileInfoDialogContent from "./FileInfoDialogContent";
import FileInfoDialogMetadata from "./FileInfoDialogMetadata";
import { useUserProvider } from "@/providers/UserProvder";
import { useAccountEmails } from "@/hooks/useAccountEmails";

type FileInfoDialogProps = {
  file: FileRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function FileInfoDialog({
  file,
  open,
  onOpenChange,
}: FileInfoDialogProps) {
  const { userData } = useUserProvider();
  const { content } = useFileContent(
    file?.file_name || "",
    file?.storage_key || "",
    userData?.account_id || "",
  );

  // Extract account IDs and check if file is editable
  const { ownerAccountId, artistAccountId } = file
    ? extractAccountIds(file.storage_key)
    : { ownerAccountId: "", artistAccountId: "" };
  const canEdit = file ? isTextFile(file.file_name) : false;

  // Fetch owner email
  const { data: emails } = useAccountEmails({
    accountIds: ownerAccountId ? [ownerAccountId] : [],
    enabled: open,
  });

  const ownerEmail = emails?.[0]?.email || undefined;

  // File editing state and operations
  const {
    isEditing,
    editedContent,
    isSaving,
    hasUnsavedChanges,
    setEditedContent,
    handleSave,
    handleEditToggle: baseHandleEditToggle,
  } = useFileEdit({
    content,
    storageKey: file?.storage_key || "",
    mimeType: file?.mime_type || null,
    ownerAccountId,
    artistAccountId,
    isOpen: open,
  });

  // Keyboard shortcut for saving
  useKeyboardSave({
    isOpen: open,
    isEditing,
    hasUnsavedChanges,
    isSaving,
    onSave: handleSave,
  });

  if (!file) return null;

  // Wrap edit toggle with text file validation
  const handleEditToggle = (editing: boolean) => {
    if (!canEdit && editing) {
      toast.error("Only text files can be edited");
      return;
    }
    baseHandleEditToggle(editing);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] sm:w-[92vw] max-w-5xl h-[90vh] p-0 gap-0 pt-6 flex flex-col">
        <FileInfoDialogHeader
          fileName={file.file_name}
          isEditing={isEditing}
          isSaving={isSaving}
          canEdit={canEdit}
          hasUnsavedChanges={hasUnsavedChanges}
          onEditToggle={handleEditToggle}
          onSave={handleSave}
        />

        <div className="flex flex-col sm:flex-row flex-1 overflow-hidden">
          <FileInfoDialogContent
            isEditing={isEditing}
            fileName={file.file_name}
            storageKey={file.storage_key}
            accountId={userData?.account_id || ""}
            editedContent={editedContent}
            onContentChange={setEditedContent}
          />
          <FileInfoDialogMetadata file={file} ownerEmail={ownerEmail} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
