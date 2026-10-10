import type { useReleaseStreams } from "@/hooks/useReleaseStreams";
import type { buildReleaseStreamSeries } from "@/lib/releases/buildReleaseStreamSeries";
import ReleaseTrackFilter from "./ReleaseTrackFilter";
import ReleaseDateFilter from "./ReleaseDateFilter";
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
  selectedIsrc: string[];
  setSelectedIsrc: (isrc: string[]) => void;
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
        <ReleaseTrackFilter
          tracks={series.tracks}
          selected={selectedIsrc}
          onChange={setSelectedIsrc}
        />
      )}
      <div className="sm:ml-auto">
        <ReleaseDateFilter data={data} />
      </div>
    </div>
  );
}
