import { formatCompact } from "@/lib/valuation/formatCompact";

interface CatalogReportStatsProps {
  totalStreams: number;
  measuredSongCount: number;
  totalSongs: number;
  releaseCount: number;
  catalogAgeYears: number;
}

/**
 * The measured-scope stat row: lifetime streams, tracks/releases measured,
 * and the age assumption feeding the run-rate proxy.
 */
const CatalogReportStats = ({
  totalStreams,
  measuredSongCount,
  totalSongs,
  releaseCount,
  catalogAgeYears,
}: CatalogReportStatsProps) => {
  const stats = [
    { label: "Lifetime streams", value: formatCompact(totalStreams) },
    {
      label: "Tracks measured",
      value: `${measuredSongCount} of ${totalSongs}`,
    },
    { label: "Releases", value: `${releaseCount}` },
    { label: "Catalog age", value: `~${catalogAgeYears}y` },
  ];

  return (
    <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl bg-card p-4 shadow-[0_0_0_1px_var(--border)]"
        >
          <dt className="text-[11px] font-heading uppercase tracking-[0.12em] text-muted-foreground">
            {stat.label}
          </dt>
          <dd className="mt-1 font-heading font-bold text-xl text-foreground">
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  );
};

export default CatalogReportStats;
