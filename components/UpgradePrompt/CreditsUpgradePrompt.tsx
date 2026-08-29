"use client";

import UpgradePrompt from "@/components/UpgradePrompt/UpgradePrompt";
import { useCreditsUpgradePrompt } from "@/hooks/useCreditsUpgradePrompt";
import { useUpgradeCheckout } from "@/hooks/useUpgradeCheckout";

/**
 * The inline credit-wall card for the usage page and the account modal.
 * Renders nothing until the balance is under 10 percent or gone.
 */
const CreditsUpgradePrompt = () => {
  const prompt = useCreditsUpgradePrompt();
  const { startCheckout } = useUpgradeCheckout();

  if (!prompt.trigger) return null;

  return (
    <div className="mb-6 rounded-xl bg-muted/40 p-4 shadow-[0_0_0_1px_var(--border)]">
      <UpgradePrompt
        trigger={prompt.trigger}
        copy={prompt.copy}
        plans={prompt.plans}
        onChoose={(plan) => void startCheckout(plan)}
        onDismiss={prompt.dismiss}
      />
    </div>
  );
};

export default CreditsUpgradePrompt;
