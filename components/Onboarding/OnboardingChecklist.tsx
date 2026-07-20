"use client";

import { X } from "lucide-react";
import OnboardingCheckpointList from "@/components/Onboarding/OnboardingCheckpointList";
import type { OnboardingCheckpoint } from "@/lib/onboarding/types";

interface OnboardingChecklistProps {
  checkpoints: OnboardingCheckpoint[];
  onResume: () => void;
  onDismiss: () => void;
}

/**
 * Pinned, dismissible checklist shown after "skip for now"
 * (recoupable/chat#1867): keeps the remaining activation checkpoints
 * visible in the app and re-opens the sequence on resume. Positioned
 * `absolute` within the (relative) home content area — never `fixed` to
 * the viewport, where the z-[65] ArtistsSidebar rail overlaps the right
 * edge and clips the dismiss button off-screen.
 */
const OnboardingChecklist = ({
  checkpoints,
  onResume,
  onDismiss,
}: OnboardingChecklistProps) => (
  <aside
    aria-label="Onboarding checklist"
    className="absolute bottom-4 right-4 z-40 w-64 rounded-xl border bg-card p-4 text-card-foreground shadow-lg"
  >
    <div className="mb-3 flex items-start justify-between gap-2">
      <p className="text-sm font-semibold text-foreground">Finish setting up</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss onboarding checklist"
        className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
      >
        <X className="size-4" />
      </button>
    </div>
    <OnboardingCheckpointList checkpoints={checkpoints} />
    <button
      type="button"
      onClick={onResume}
      className="mt-3 w-full rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
    >
      Resume setup
    </button>
  </aside>
);

export default OnboardingChecklist;
