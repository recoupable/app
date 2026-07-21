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
 * dismiss — clicking "Finish setting up" re-opens the sequence. Positioned
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
    <button
      type="button"
      onClick={onResume}
      className="mb-3 w-full text-left text-sm font-semibold text-foreground transition-colors hover:text-primary"
    >
      Finish setting up
    </button>
    <OnboardingCheckpointList checkpoints={checkpoints} />
  </aside>
);

export default OnboardingChecklist;
