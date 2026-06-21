import { CatalogSongsResponse } from "@/lib/catalog/getCatalogSongs";
import { Disc3, ListMusic } from "lucide-react";

interface InsertCatalogSongsSummaryProps {
  totalAdded?: number;
  pagination?: CatalogSongsResponse["pagination"];
}

function StatChip({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Disc3;
  value: number;
  label: string;
}) {
  return (
    <div className="flex flex-1 items-center gap-3 rounded-xl border border-border bg-muted/40 px-3 py-2.5">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground">
        <Icon className="size-[18px]" />
      </div>
      <div className="min-w-0">
        <div className="text-lg font-semibold leading-none tabular-nums text-foreground">
          {value.toLocaleString()}
        </div>
        <div className="mt-1 truncate text-xs text-muted-foreground">
          {label}
        </div>
      </div>
    </div>
  );
}

/**
 * Displays a summary of catalog song insertion results as stat chips:
 * number of songs processed and the total catalog count.
 */
export default function InsertCatalogSongsSummary({
  totalAdded,
  pagination,
}: InsertCatalogSongsSummaryProps) {
  if (totalAdded === undefined) return null;

  return (
    <div className="flex flex-wrap items-stretch gap-2">
      <StatChip icon={ListMusic} value={totalAdded} label="Songs processed" />
      {pagination && (
        <StatChip
          icon={Disc3}
          value={pagination.total_count}
          label="Total in catalog"
        />
      )}
    </div>
  );
}
