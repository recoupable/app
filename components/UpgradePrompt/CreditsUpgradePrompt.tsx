"use client";

import UpgradePromptDialog from "@/components/UpgradePrompt/UpgradePromptDialog";
import { useCreditsUpgradePrompt } from "@/hooks/useCreditsUpgradePrompt";
import { useUpgradeNavigation } from "@/hooks/useUpgradeNavigation";
import type { UpgradeTrigger } from "@/lib/upgrade/types";

/**
 * Global credit-wall upsell: same centered dialog as the task-cap prompt.
 * Mount once under Providers; renders nothing until the balance is under
 * 10 percent or gone (and not dismissed for the session).
 */
const CreditsUpgradePrompt = () => {
  const prompt = useCreditsUpgradePrompt();
  const { upgrade } = useUpgradeNavigation();

  if (!prompt.trigger) return null;

  const close = () => prompt.dismiss();
  const onUpgrade = (trigger: UpgradeTrigger) => {
    close();
    upgrade(trigger);
  };

  return (
    <UpgradePromptDialog
      open
      onOpenChange={(open) => !open && close()}
      trigger={prompt.trigger}
      copy={prompt.copy}
      onUpgrade={onUpgrade}
      onDismiss={close}
    />
  );
};

export default CreditsUpgradePrompt;
