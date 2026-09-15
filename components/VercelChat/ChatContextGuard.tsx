"use client";

import { useEffect, useState } from "react";
import { useVercelChatContext } from "@/providers/VercelChatProvider";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export default function ChatContextGuard() {
  const {
    input,
    attachments,
    textAttachments,
    hasPendingUploads,
    status,
    setInput,
    clearAttachments,
    setTextAttachments,
  } = useVercelChatContext();
  const [pending, setPending] = useState<(() => void) | null>(null);
  useEffect(() => {
    const guard = (event: Event) => {
      if (
        status === "streaming" ||
        status === "submitted" ||
        hasPendingUploads
      ) {
        event.preventDefault();
        toast.info(
          "Wait for the current response or upload to finish before switching.",
        );
      } else if (input.trim() || attachments.length || textAttachments.length) {
        event.preventDefault();
        setPending(() => (event as CustomEvent<() => void>).detail);
      }
    };
    window.addEventListener("recoup:context-switch", guard);
    return () => window.removeEventListener("recoup:context-switch", guard);
  }, [
    input,
    attachments.length,
    textAttachments.length,
    hasPendingUploads,
    status,
  ]);
  return (
    <AlertDialog
      open={!!pending}
      onOpenChange={(open) => {
        if (!open) setPending(null);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Switch and discard this draft?</AlertDialogTitle>
          <AlertDialogDescription>
            Your unsent message and attachments will be cleared. Sent
            conversations stay saved.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep writing</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              const action = pending;
              setPending(null);
              setInput("");
              clearAttachments();
              setTextAttachments([]);
              action?.();
            }}
          >
            Discard and switch
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
