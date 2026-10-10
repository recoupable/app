import type { useReleaseStreams } from "@/hooks/useReleaseStreams";
import type { buildReleaseStreamSeries } from "@/lib/releases/buildReleaseStreamSeries";
const selectClass =
  "h-11 sm:h-9 max-w-full min-w-0 rounded-lg bg-transparent pl-3 pr-7 text-sm shadow-[0_0_0_1px_var(--input)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
export default function ReleaseStreamControls({
  data,
  series,
  selectedIsrc,
  setSelectedIsrc,
}: {
  data: ReturnType<typeof useReleaseStreams>;
  series: ReturnType<typeof buildReleaseStreamSeries> | null;
  selectedIsrc: string;
  setSelectedIsrc: (isrc: string) => void;
}) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      {(data.catalogs.length > 1 ||
        (!data.catalogId && data.catalogs.length > 0)) && (
        <select
          aria-label="Stream catalog"
          className={selectClass}
          value={data.catalogId}
          disabled={data.catalogsLoading || data.enabling}
          onChange={(event) => data.selectCatalog(event.target.value)}
        >
          <option value="">Select catalog</option>
          {data.catalogs.map((catalog) => (
            <option key={catalog.id} value={catalog.id}>
              {catalog.name}
            </option>
          ))}
        </select>
      )}
      {series && (
        <select
          aria-label="Stream recording"
          className={`${selectClass} w-full sm:w-auto sm:max-w-48`}
          value={selectedIsrc}
          onChange={(event) => setSelectedIsrc(event.target.value)}
        >
          <option value="">All songs</option>
          {[
            ...new Map(
              series.tracks
                .filter((track) => track.isrc)
                .map((track) => [track.isrc, track]),
            ).values(),
          ].map((track) => (
            <option key={track.isrc} value={track.isrc!}>
              {track.title}
            </option>
          ))}
        </select>
      )}
      <div
        role="group"
        aria-label="Stream period"
        className="flex rounded-lg bg-muted p-1"
      >
        {[7, 28, 31].map((days) => (
          <button
            key={days}
            type="button"
            aria-label={`Last ${days} days`}
            aria-pressed={data.days === days}
            onClick={() => data.setDays(days)}
            className={`h-9 min-w-11 rounded-md px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-7 ${data.days === days ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            {days}D
          </button>
        ))}
      </div>
    </div>
  );
}
