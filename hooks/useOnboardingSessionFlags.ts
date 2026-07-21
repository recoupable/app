"use client";

import { useCallback, useEffect, useState } from "react";
import { readOnboardingFlag } from "@/lib/onboarding/readOnboardingFlag";
import { writeOnboardingFlag } from "@/lib/onboarding/writeOnboardingFlag";

export interface OnboardingSessionFlags {
  skipped: boolean;
  skip: () => void;
  resume: () => void;
}

/**
 * Session-scoped skip escape hatch for the onboarding gate
 * (recoupable/chat#1867), keyed by account id so an account switch in the
 * same tab re-derives from that account's own flag instead of inheriting
 * the previous account's choice. Never persisted server-side.
 */
export function useOnboardingSessionFlags(
  accountId: string,
): OnboardingSessionFlags {
  const [skipped, setSkipped] = useState(() =>
    readOnboardingFlag("skipped", accountId),
  );

  useEffect(() => {
    setSkipped(readOnboardingFlag("skipped", accountId));
  }, [accountId]);

  const skip = useCallback(() => {
    writeOnboardingFlag("skipped", accountId, true);
    setSkipped(true);
  }, [accountId]);

  const resume = useCallback(() => {
    writeOnboardingFlag("skipped", accountId, false);
    setSkipped(false);
  }, [accountId]);

  return { skipped, skip, resume };
}
