"use client";

import * as Dialog from "@radix-ui/react-dialog";
import type { Evidence } from "@/lib/intelligent-ui/schema";
import EvidencePanel from "./EvidencePanel";

export default function EvidenceDialog({
  evidence,
  onClose,
  returnFocus,
}: {
  evidence: Evidence | null;
  onClose: () => void;
  returnFocus: HTMLElement | null;
}) {
  return (
    <Dialog.Root
      open={evidence !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/25" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed top-1/2 left-1/2 z-50 max-h-[85dvh] w-[calc(100%_-_2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-card shadow-xl outline-none"
          onCloseAutoFocus={(event) => {
            if (returnFocus?.isConnected) {
              event.preventDefault();
              returnFocus.focus({ preventScroll: true });
            }
          }}
        >
          <Dialog.Title className="sr-only">Source details</Dialog.Title>
          {evidence && <EvidencePanel evidence={evidence} onClose={onClose} />}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
