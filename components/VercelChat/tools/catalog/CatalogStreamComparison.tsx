import { parseCatalogStreamComparison } from "@/lib/catalog/parseCatalogStreamComparison";
import CatalogStreamComparisonRow from "./CatalogStreamComparisonRow";

export default function CatalogStreamComparison({
  result,
}: {
  result: unknown;
}) {
  const data = parseCatalogStreamComparison(result);
  if (!data)
    return (
      <p className="rounded-lg border p-4 text-sm">
        Comparison unavailable: the returned data does not match the supported
        recording, period, or stream-measurement contract.
      </p>
    );
  const { periods, pagination, recordings } = data;
  return (
    <section className="my-2 min-w-0 space-y-3 rounded-lg border bg-background p-4 text-sm">
      <h3 className="font-semibold">Recording stream comparison</h3>
      <p>Luminate · Worldwide · All reporting DSPs · Daily streams</p>
      <p className="text-muted-foreground">
        Source-reported aggregate streams, not Spotify-only streams, listeners,
        or royalties. Both periods use the catalog’s current recording
        membership.
      </p>
      <dl className="grid gap-1 text-xs">
        <div>
          <dt className="inline font-medium">Previous: </dt>
          <dd className="inline">
            {periods.previous.start} to {periods.previous.end_exclusive} (end
            excluded)
          </dd>
        </div>
        <div>
          <dt className="inline font-medium">Current: </dt>
          <dd className="inline">
            {periods.current.start} to {periods.current.end_exclusive} (end
            excluded)
          </dd>
        </div>
      </dl>
      <p>{periods.days} days per period · UTC</p>
      <p>
        Page {pagination.page}: {recordings.length} returned recordings of{" "}
        {pagination.total_count} current catalog recordings. Comparisons cover
        this returned page only.
        {pagination.has_more ? " More recordings remain on later pages." : ""}
      </p>
      <p className="text-xs text-muted-foreground">
        Source updated: {data.source_updated_at ?? "Unknown"}. Retrieval times
        are shown per recording; complete periods do not establish provider
        freshness.
      </p>
      {recordings.length ? (
        <div
          className="overflow-x-auto"
          tabIndex={0}
          role="region"
          aria-label="Recording comparison table"
        >
          <table className="w-full text-sm">
            <caption className="sr-only">
              Saved recording stream comparison
            </caption>
            <thead>
              <tr className="text-left text-xs text-muted-foreground">
                <th scope="col" className="p-3">
                  Recording
                </th>
                <th scope="col" className="p-3 text-right">
                  Previous streams
                </th>
                <th scope="col" className="p-3 text-right">
                  Current streams
                </th>
                <th scope="col" className="p-3 text-right">
                  Change in streams
                </th>
                <th scope="col" className="p-3 text-right">
                  Change (%)
                </th>
              </tr>
            </thead>
            <tbody>
              {recordings.map((row) => (
                <CatalogStreamComparisonRow key={row.isrc} row={row} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>
          No recordings returned on this page. This is not evidence of zero
          streams.
        </p>
      )}
    </section>
  );
}
