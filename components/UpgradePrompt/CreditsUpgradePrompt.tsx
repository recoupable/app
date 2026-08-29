"use client";

import UpgradePrompt from "@/components/UpgradePrompt/UpgradePrompt";
import { useCreditsUpgradePrompt } from "@/hooks/useCreditsUpgradePrompt";
import { useUpgradeNavigation } from "@/hooks/useUpgradeNavigation";

/**
 * The inline credit-wall card for the usage page and the account modal.
 * Renders nothing until the balance is under 10 percent or gone.
 */
const CreditsUpgradePrompt = () => {
  const prompt = useCreditsUpgradePrompt();
  const { upgrade } = useUpgradeNavigation();

  if (!prompt.trigger) return null;

  return (
    <div className="mb-6 rounded-xl bg-background p-5 shadow-[0_0_0_1px_var(--border)] sm:p-6">
      <UpgradePrompt trigger={prompt.trigger} copy={prompt.copy} onUpgrade={upgrade} onDismiss={prompt.dismiss} />
    </div>
  );
};

export default CreditsUpgradePrompt;
