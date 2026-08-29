"use client";

import { useRouter } from "next/navigation";
import { useUserProvider } from "@/providers/UserProvder";
import { trackUpgradeClicked } from "@/lib/upgrade/trackUpgradeClicked";
import type { UpgradeTrigger } from "@/lib/upgrade/types";

/** What the prompt's Upgrade button does: record the click, open the plan page. */
export function useUpgradeNavigation() {
  const router = useRouter();
  const { userData } = useUserProvider();

  const upgrade = (trigger: UpgradeTrigger) => {
    trackUpgradeClicked({ trigger, accountId: userData?.account_id ?? "" });
    router.push("/plan");
  };

  return { upgrade };
}
