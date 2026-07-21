"use client";

import OnboardingCheckpointList from "@/components/Onboarding/OnboardingCheckpointList";
import type { OnboardingCheckpoint } from "@/lib/onboarding/types";

interface OnboardingChecklistProps {
  checkpoints: OnboardingCheckpoint[];
  onResume: () => void;
}

/**
 * Pinned checklist shown after "skip for now" (recoupable/chat#1867): a
 * persistent reminder of the remaining activation checkpoints with no
 * dismiss — the "Continue" button re-opens the sequence. Positioned
 * `absolute` within the (relative) home content area, never `fixed` to the
 * viewport where the z-[65] ArtistsSidebar rail overlaps and clips it.
 */
const OnboardingChecklist = ({
  checkpoints,
  onResume,
}: OnboardingChecklistProps) => (
  <aside
    aria-label="Onboarding checklist"
    className="absolute bottom-4 right-4 z-40 w-64 rounded-xl border bg-card p-4 text-card-foreground shadow-lg"
  >
    <p className="mb-3 text-sm font-semibold text-foreground">
      Finish setting up
    </p>
    <OnboardingCheckpointList checkpoints={checkpoints} />
    <button
      type="button"
      onClick={onResume}
      className="mt-3 w-full rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
    >
      Continue
    </button>
  </aside>
);

export default OnboardingChecklist;
