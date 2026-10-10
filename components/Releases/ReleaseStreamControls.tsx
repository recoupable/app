import type { useReleaseStreams } from "@/hooks/useReleaseStreams";
import type { buildReleaseStreamSeries } from "@/lib/releases/buildReleaseStreamSeries";
const selectClass =
  "h-11 sm:h-10 max-w-full rounded-lg bg-background px-3 text-sm shadow-[0_0_0_1px_var(--input)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
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
    <div className="flex flex-wrap gap-4">
      <label className="flex min-w-0 flex-col gap-2 text-sm">
        Catalog
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
      </label>
      <label className="flex flex-col gap-2 text-sm">
        Period
        <select
          aria-label="Stream period"
          className={selectClass}
          value={data.days}
          onChange={(event) => data.setDays(Number(event.target.value))}
        >
          {[7, 28, 31].map((days) => (
            <option key={days} value={days}>
              Last {days} days
            </option>
          ))}
        </select>
      </label>
      {series && (
        <label className="flex min-w-0 flex-col gap-2 text-sm">
          Recording
          <select
            aria-label="Stream recording"
            className={selectClass}
            value={selectedIsrc}
            onChange={(event) => setSelectedIsrc(event.target.value)}
          >
            <option value="">Release total</option>
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
        </label>
      )}
    </div>
  );
}
