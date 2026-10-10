"use client";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { useReleaseStreams } from "@/hooks/useReleaseStreams";
import { buildReleaseStreamSeries } from "@/lib/releases/buildReleaseStreamSeries";
import type { ReleaseCase } from "@/lib/releases/types";
import ReleaseStreamControls from "./ReleaseStreamControls";
import ReleaseStreamRequestStates from "./ReleaseStreamRequestStates";
import ReleaseStreamTracking from "./ReleaseStreamTracking";
import ReleaseStreamHistory from "./ReleaseStreamHistory";
interface Props {
  current: ReleaseCase;
  data: ReturnType<typeof useReleaseStreams>;
}

export default function ReleaseStreamPanel({ current, data }: Props) {
  const [selection, setSelection] = useState({
    catalogId: data.catalogId,
    isrc: "",
  });
  const selectedIsrc =
    selection.catalogId === data.catalogId ? selection.isrc : "";
  const setSelectedIsrc = (isrc: string) =>
    setSelection({ catalogId: data.catalogId, isrc });
  const series = useMemo(
    () =>
      data.history
        ? buildReleaseStreamSeries(
            current,
            data.history,
            selectedIsrc || undefined,
          )
        : null,
    [current, data.history, selectedIsrc],
  );
  return (
    <section
      className="space-y-5 rounded-xl bg-card p-4 sm:p-6 shadow-[0_0_0_1px_var(--border)]"
      aria-label="Release streams"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Streams</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Worldwide · All reporting DSPs · Luminate
          </p>
        </div>
        <Button
          variant="outline"
          disabled={data.loading || data.enabling || !data.catalogId}
          onClick={data.refresh}
        >
          Refresh streams
        </Button>
      </div>
      <ReleaseStreamControls
        data={data}
        series={series}
        selectedIsrc={selectedIsrc}
        setSelectedIsrc={setSelectedIsrc}
      />
      <ReleaseStreamRequestStates data={data} />
      <ReleaseStreamTracking data={data} />
      <ReleaseStreamHistory data={data} series={series} />
      <p className="text-xs text-muted-foreground">
        Source-reported streams across DSPs, with a two-day reporting buffer.
      </p>
    </section>
  );
}
