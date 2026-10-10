"use client";
import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { useReleaseStreams } from "@/hooks/useReleaseStreams";
import { buildReleaseStreamSeries } from "@/lib/releases/buildReleaseStreamSeries";
import type { ReleaseCase } from "@/lib/releases/types";
import ReleaseStreamControls from "./ReleaseStreamControls";
import ReleaseStreamRequestStates from "./ReleaseStreamRequestStates";
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
      className="space-y-5 rounded-2xl bg-card p-5 sm:p-7 shadow-[0_0_0_1px_var(--border)]"
      aria-label="Release streams"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-medium tracking-tight">Streams</h2>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Refresh streams"
          title="Refresh streams"
          disabled={data.loading || data.enabling || !data.catalogId}
          onClick={data.refresh}
        >
          <RefreshCw
            aria-hidden="true"
            className={`size-4 ${data.loading ? "animate-spin motion-reduce:animate-none" : ""}`}
          />
        </Button>
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
