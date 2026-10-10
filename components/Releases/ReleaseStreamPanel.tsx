"use client";
import { useMemo, useState } from "react";
import type { useReleaseStreams } from "@/hooks/useReleaseStreams";
import { buildReleaseStreamSeries } from "@/lib/releases/buildReleaseStreamSeries";
import type { StreamRelease } from "@/lib/releases/catalogStreamTypes";
import ReleaseStreamControls from "./ReleaseStreamControls";
import ReleaseStreamRequestStates from "./ReleaseStreamRequestStates";
import ReleaseStreamHistory from "./ReleaseStreamHistory";
interface Props {
  current: StreamRelease;
  data: ReturnType<typeof useReleaseStreams>;
}

export default function ReleaseStreamPanel({ current, data }: Props) {
  const [selection, setSelection] = useState({
    catalogId: data.catalogId,
    isrc: [] as string[],
  });
  const selectedIsrc = useMemo(
    () => (selection.catalogId === data.catalogId ? selection.isrc : []),
    [selection, data.catalogId],
  );
  const setSelectedIsrc = (isrc: string[]) =>
    setSelection({ catalogId: data.catalogId, isrc });
  const series = useMemo(
    () =>
      data.history
        ? buildReleaseStreamSeries(current, data.history, selectedIsrc)
        : null,
    [current, data.history, selectedIsrc],
  );
  return (
    <section
      className="space-y-5 rounded-2xl bg-card p-5 sm:p-7 shadow-[0_0_0_1px_var(--border)]"
      aria-label="Release streams"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-medium tracking-tight">Streams</h2>
      </div>
      <ReleaseStreamControls
        data={data}
        series={series}
        selectedIsrc={selectedIsrc}
        setSelectedIsrc={setSelectedIsrc}
      />
      <ReleaseStreamRequestStates data={data} />
      <ReleaseStreamHistory data={data} series={series} />
    </section>
  );
}
