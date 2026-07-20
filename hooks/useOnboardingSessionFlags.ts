"use client";

import { useCallback, useEffect, useState } from "react";
import { readOnboardingFlag } from "@/lib/onboarding/readOnboardingFlag";
import { writeOnboardingFlag } from "@/lib/onboarding/writeOnboardingFlag";

export interface OnboardingSessionFlags {
  skipped: boolean;
  checklistDismissed: boolean;
  skip: () => void;
  resume: () => void;
  dismissChecklist: () => void;
}

/**
 * Session-scoped skip/dismiss escape hatches for the onboarding gate
 * (recoupable/chat#1867), keyed by account id so an account switch in the
 * same tab re-derives from that account's own flags instead of inheriting
 * the previous account's choice. Never persisted server-side.
 */
export function useOnboardingSessionFlags(
  accountId: string,
): OnboardingSessionFlags {
  const [skipped, setSkipped] = useState(() =>
    readOnboardingFlag("skipped", accountId),
  );
  const [checklistDismissed, setChecklistDismissed] = useState(() =>
    readOnboardingFlag("checklist-dismissed", accountId),
  );

  useEffect(() => {
    setSkipped(readOnboardingFlag("skipped", accountId));
    setChecklistDismissed(readOnboardingFlag("checklist-dismissed", accountId));
  }, [accountId]);

  const skip = useCallback(() => {
    writeOnboardingFlag("skipped", accountId, true);
    setSkipped(true);
  }, [accountId]);

  const resume = useCallback(() => {
    writeOnboardingFlag("skipped", accountId, false);
    writeOnboardingFlag("checklist-dismissed", accountId, false);
    setSkipped(false);
    setChecklistDismissed(false);
  }, [accountId]);

  const dismissChecklist = useCallback(() => {
    writeOnboardingFlag("checklist-dismissed", accountId, true);
    setChecklistDismissed(true);
  }, [accountId]);

  return { skipped, checklistDismissed, skip, resume, dismissChecklist };
}
