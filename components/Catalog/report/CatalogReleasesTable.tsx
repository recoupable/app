import type { ReleaseRollup } from "@/lib/catalog/buildReleaseRollups";
import CatalogReleaseRow from "./CatalogReleaseRow";

interface CatalogReleasesTableProps {
  releases: ReleaseRollup[];
}

/**
 * Per-release breakdown of the measured catalog, sorted by streams.
 */
const CatalogReleasesTable = ({ releases }: CatalogReleasesTableProps) => {
  if (releases.length === 0) return null;

  return (
    <section
      aria-label="Releases measured"
      className="rounded-2xl bg-card p-4 sm:p-6 shadow-[0_0_0_1px_var(--border)]"
    >
      <h2 className="font-heading text-sm font-bold uppercase tracking-[0.12em] text-muted-foreground pb-2">
        Releases measured
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="py-2 pr-3 font-medium">Release</th>
              <th className="py-2 px-3 font-medium text-right">
                Tracks measured
              </th>
              <th className="py-2 pl-3 font-medium text-right">Streams</th>
            </tr>
          </thead>
          <tbody>
            {releases.map((release, index) => (
              <CatalogReleaseRow
                key={release.album ?? `untitled-${index}`}
                release={release}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default CatalogReleasesTable;
