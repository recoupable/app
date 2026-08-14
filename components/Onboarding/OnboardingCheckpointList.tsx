"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { getOnboardingStepTitle } from "@/lib/onboarding/getOnboardingStepTitle";
import type { OnboardingCheckpoint } from "@/lib/onboarding/types";

/**
 * Read-only list of activation checkpoints with completion state, used by the
 * pinned checklist. Titles come from `getOnboardingStepTitle` — the placeholder
 * step-card content it used to read is gone (chat#1889), since each step now
 * renders its own real heading inside `/setup/*`.
 */
const OnboardingCheckpointList = ({
  checkpoints,
}: {
  checkpoints: OnboardingCheckpoint[];
}) => (
  <ul className="flex flex-col gap-2">
    {checkpoints.map((checkpoint) => (
      <li key={checkpoint.id} className="flex items-center gap-2 text-sm">
        <span
          aria-hidden="true"
          className={cn(
            "flex size-4 shrink-0 items-center justify-center rounded-full",
            checkpoint.complete
              ? "bg-primary text-primary-foreground"
              : "border border-muted-foreground/40",
          )}
        >
          {checkpoint.complete && <Check className="size-3" />}
        </span>
        <span
          className={cn(
            checkpoint.complete
              ? "text-muted-foreground line-through"
              : "text-foreground",
          )}
        >
          {getOnboardingStepTitle(checkpoint.id)}
        </span>
        <span className="sr-only">
          {checkpoint.complete ? "(complete)" : "(incomplete)"}
        </span>
      </li>
    ))}
  </ul>
);

export default OnboardingCheckpointList;
