import { useEffect, useState } from "react";

type Args = {
  isText: boolean;
  textContent: string;
};

export const useKnowledgeEditor = ({ isText, textContent }: Args) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // When entering edit mode, seed the editor with the latest fetched content
  useEffect(() => {
    if (isEditing) setEditedText(textContent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, textContent]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      if (isText && isEditing && editedText !== textContent) {
        const shouldClose = window.confirm("You have unsaved edits. Discard changes?");
        if (!shouldClose) return;
      }
    }
    setIsOpen(open);
  };

  return {
    isEditing,
    setIsEditing,
    editedText,
    setEditedText,
    isOpen,
    handleOpenChange,
  } as const;
};

export default useKnowledgeEditor;