import { cn } from "@/lib/utils";
import type { MusicGenerationStatus } from "@/types/Music";

const LABELS: Record<MusicGenerationStatus, string> = {
  pending: "Queued",
  processing: "Processing",
  completed: "Completed",
  failed: "Failed",
};

// Tints, not solid fills, per DESIGN.md. Dark mode gets a stronger tint and a
// brighter text colour because the light-mode 8% wash is invisible on the
// near-black card.
const STYLES: Record<MusicGenerationStatus, string> = {
  pending: "bg-[#0070f3]/10 text-[#0060d3] dark:bg-[#0070f3]/20 dark:text-[#5aa9ff]",
  processing: "bg-[#f59e0b]/10 text-[#b45309] dark:bg-[#f59e0b]/20 dark:text-[#f59e0b]",
  completed: "bg-[#22c55e]/10 text-[#15803d] dark:bg-[#22c55e]/20 dark:text-[#22c55e]",
  failed: "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-[#f87171]",
};

const MusicStatusPill = ({ status }: { status: MusicGenerationStatus }) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
      STYLES[status],
    )}
  >
    {LABELS[status]}
  </span>
);

export default MusicStatusPill;
