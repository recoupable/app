import { useState } from "react";
import { useUserProvider } from "@/providers/UserProvder";

/**
 * Hook for managing the Create Workspace modal state
 * Handles the isPrepared check before opening
 */
export function useCreateWorkspaceModal() {
  const { isPrepared } = useUserProvider();
  const [isOpen, setIsOpen] = useState(false);

  const open = () => {
    if (!isPrepared()) return;
    setIsOpen(true);
  };

  const close = () => setIsOpen(false);

  return { isOpen, open, close };
}

export default useCreateWorkspaceModal;
