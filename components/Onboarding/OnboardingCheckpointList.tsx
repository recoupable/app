"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { getOnboardingStepContent } from "@/lib/onboarding/getOnboardingStepContent";
import type { OnboardingCheckpoint } from "@/lib/onboarding/types";

/**
 * Read-only list of activation checkpoints with completion state. Shared
 * by the onboarding sequence (progress) and the pinned checklist.
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
          {getOnboardingStepContent(checkpoint.id).title}
        </span>
        <span className="sr-only">
          {checkpoint.complete ? "(complete)" : "(incomplete)"}
        </span>
      </li>
    ))}
  </ul>
);

export default OnboardingCheckpointList;
