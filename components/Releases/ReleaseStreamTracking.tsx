import { Button } from "@/components/ui/button";
import type { useReleaseStreams } from "@/hooks/useReleaseStreams";
export default function ReleaseStreamTracking({
  data,
}: {
  data: ReturnType<typeof useReleaseStreams>;
}) {
  const collecting = ["queued", "running"].includes(
    data.tracking?.latest_run?.status ?? "",
  );
  return (
    <>
      {data.tracking && (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <p className="text-muted-foreground">
            {collecting
              ? "Collecting daily history… Refresh streams to check progress."
              : data.tracking.tracking?.enabled
                ? "Daily tracking on · 09:00 UTC"
                : "Daily tracking off"}
            {data.tracking.latest_run?.status === "failed"
              ? " · Last collection failed"
              : data.tracking.latest_run?.status === "partial"
                ? " · Last collection has gaps"
                : ""}
          </p>
          {!data.tracking.tracking?.enabled && (
            <Button
              size="sm"
              disabled={data.enabling}
              onClick={() => void data.enable()}
            >
              {data.enabling ? "Enabling…" : "Enable daily tracking"}
            </Button>
          )}
          {!data.tracking.tracking?.enabled && (
            <p className="text-xs text-muted-foreground">
              Enables daily collection for every recording in the selected
              catalog.
            </p>
          )}
        </div>
      )}
    </>
  );
}
