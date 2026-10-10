import { AlertCircle, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { useReleaseStreams } from "@/hooks/useReleaseStreams";
export default function ReleaseStreamTracking({
  data,
}: {
  data: ReturnType<typeof useReleaseStreams>;
}) {
  if (!data.tracking) return null;
  const status = data.tracking.latest_run?.status;
  const collecting = ["queued", "running"].includes(status ?? "");
  if (!data.tracking.tracking?.enabled)
    return (
      <div className="space-y-2">
        <Button
          size="sm"
          disabled={data.enabling}
          onClick={() => void data.enable()}
        >
          {data.enabling ? "Enabling…" : "Enable daily tracking"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Tracks every recording in the selected catalog.
        </p>
      </div>
    );
  const Icon = collecting
    ? Loader2
    : ["failed", "partial"].includes(status ?? "")
      ? AlertCircle
      : Check;
  return (
    <span
      role={collecting ? "status" : undefined}
      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
    >
      <Icon
        aria-hidden="true"
        className={`size-3.5 ${collecting ? "animate-spin motion-reduce:animate-none" : ""}`}
      />
      {collecting
        ? "Updating…"
        : status === "failed"
          ? "Update failed"
          : status === "partial"
            ? "Some days missing"
            : "Daily updates"}
    </span>
  );
}
