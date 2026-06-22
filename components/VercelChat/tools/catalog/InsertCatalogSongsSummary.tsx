"use client";

import { useEffect, useState } from "react";
import { animate } from "framer-motion";
import { CheckCircle2, Disc3, ListMusic } from "lucide-react";
import { CatalogSongsResponse } from "@/lib/catalog/getCatalogSongs";
import { cn } from "@/lib/utils";

interface InsertCatalogSongsSummaryProps {
  totalAdded?: number;
  pagination?: CatalogSongsResponse["pagination"];
}

type Tone = "success" | "neutral" | "muted";

const TONES: Record<Tone, { chip: string; icon: string; value: string }> = {
  success: {
    chip: "border-emerald-500/20 bg-emerald-500/5",
    icon: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    value: "text-emerald-600 dark:text-emerald-400",
  },
  neutral: {
    chip: "border-border bg-muted/40",
    icon: "bg-background text-foreground/70",
    value: "text-foreground",
  },
  muted: {
    chip: "border-border bg-muted/40",
    icon: "bg-background text-muted-foreground",
    value: "text-muted-foreground",
  },
};

// Numbers that tick up feel earned.
function useCountUp(target: number) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const controls = animate(0, target, {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [target]);
  return value;
}

function StatChip({
  icon: Icon,
  value,
  label,
  tone,
}: {
  icon: typeof Disc3;
  value: number;
  label: string;
  tone: Tone;
}) {
  const animated = useCountUp(value);
  const t = TONES[tone];
  return (
    <div
      className={cn(
        "flex flex-1 items-center gap-3 rounded-xl border px-3 py-2.5",
        t.chip,
      )}
    >
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          t.icon,
        )}
      >
        <Icon className="size-[18px]" />
      </div>
      <div className="min-w-0">
        <div
          className={cn(
            "text-lg font-semibold leading-none tabular-nums",
            t.value,
          )}
        >
          {animated.toLocaleString()}
        </div>
        <div className="mt-1 truncate text-xs text-muted-foreground">
          {label}
        </div>
      </div>
    </div>
  );
}

/**
 * Reconciliation summary for a catalog import: how many songs were added and
 * how many now live in the catalog. Counts come straight from the result so
 * the numbers are always honest — nothing is invented.
 */
export default function InsertCatalogSongsSummary({
  totalAdded,
  pagination,
}: InsertCatalogSongsSummaryProps) {
  if (totalAdded === undefined) return null;

  const total = pagination?.total_count;
  // Matched duplicates: songs already in the catalog before this import. Only
  // derivable (and non-negative) when the post-import total exceeds what we
  // just added; otherwise we don't fabricate a number.
  const existing =
    total !== undefined && total >= totalAdded ? total - totalAdded : undefined;
  const addedTone: Tone = totalAdded > 0 ? "success" : "muted";

  return (
    <div className="flex flex-wrap items-stretch gap-2">
      <StatChip
        icon={totalAdded > 0 ? CheckCircle2 : ListMusic}
        value={totalAdded}
        label={totalAdded === 1 ? "Song added" : "Added to catalog"}
        tone={addedTone}
      />
      {existing !== undefined && (
        <StatChip
          icon={ListMusic}
          value={existing}
          label="Already in catalog"
          tone="muted"
        />
      )}
      {total !== undefined && (
        <StatChip
          icon={Disc3}
          value={total}
          label="Total in catalog"
          tone="neutral"
        />
      )}
    </div>
  );
}
