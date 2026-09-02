"use client";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import UpgradePrompt from "@/components/UpgradePrompt/UpgradePrompt";
import type { UpgradeCopy, UpgradeTrigger } from "@/lib/upgrade/types";

export interface UpgradePromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: UpgradeTrigger;
  copy: UpgradeCopy;
  onUpgrade: (trigger: UpgradeTrigger) => void;
  onDismiss: () => void;
}

/**
 * Shared upsell shell: shadcn Dialog (centered on every breakpoint) around
 * the single UpgradePrompt card. Credits and task-cap hosts both use this.
 */
const UpgradePromptDialog = ({
  open,
  onOpenChange,
  trigger,
  copy,
  onUpgrade,
  onDismiss,
}: UpgradePromptDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-lg gap-0 p-5 sm:p-6">
      <UpgradePrompt
        trigger={trigger}
        copy={copy}
        onUpgrade={onUpgrade}
        onDismiss={onDismiss}
        renderTitle={(headline) => (
          <DialogTitle className="text-[28px] font-semibold leading-8 tracking-[-0.02em] sm:text-[32px] sm:leading-9">
            {headline}
          </DialogTitle>
        )}
        renderBody={(body) => (
          <DialogDescription className="text-sm text-muted-foreground">{body}</DialogDescription>
        )}
      />
    </DialogContent>
  </Dialog>
);

export default UpgradePromptDialog;
