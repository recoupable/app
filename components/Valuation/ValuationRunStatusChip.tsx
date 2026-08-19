"use client";

import { Loader2 } from "lucide-react";
import useValuationRunStatus from "@/hooks/useValuationRunStatus";

/**
 * In-flight valuation status (chat#1973): a small pill that appears wherever
 * the customer is standing while a run measures, and disappears on any
 * terminal state. Renders nothing when no run is in flight, so it can mount
 * unconditionally on the home, artists and catalog surfaces.
 */
const ValuationRunStatusChip = ({ className }: { className?: string }) => {
  const { run, isInFlight } = useValuationRunStatus();

  if (!isInFlight || !run) return null;

  return (
    <span
      role="status"
      className={`inline-flex items-center gap-2 rounded-full bg-card px-3 py-1 text-xs text-muted-foreground shadow-[0px_0px_0px_1px_var(--border)] ${className ?? ""}`}
    >
      <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
      Valuation in progress
      {run.album_count ? ` · measuring ${run.album_count} releases` : ""}
    </span>
  );
};

export default ValuationRunStatusChip;
