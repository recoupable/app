import type { ReleaseRollup } from "@/lib/catalog/buildReleaseRollups";
import { formatCompact } from "@/lib/valuation/formatCompact";
import ReleaseArtTile from "./ReleaseArtTile";

interface CatalogReleaseRowProps {
  release: ReleaseRollup;
}

/**
 * One release in the report table. Null-safe: releases with missing album or
 * artist metadata render with placeholders.
 */
const CatalogReleaseRow = ({ release }: CatalogReleaseRowProps) => {
  const artistName = release.artistNames[0];

  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="py-2.5 pr-3">
        <div className="flex items-center gap-3">
          <ReleaseArtTile album={release.album} artistName={artistName} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {release.album || "Untitled release"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {release.artistNames.length > 0
                ? release.artistNames.join(", ")
                : "Unknown artist"}
            </p>
          </div>
        </div>
      </td>
      <td className="py-2.5 px-3 text-right text-sm text-muted-foreground whitespace-nowrap">
        {release.measuredTrackCount === release.trackCount
          ? release.trackCount
          : `${release.measuredTrackCount} of ${release.trackCount}`}
      </td>
      <td className="py-2.5 pl-3 text-right font-heading font-bold text-sm text-foreground whitespace-nowrap">
        {release.measuredTrackCount > 0 ? formatCompact(release.streams) : "—"}
      </td>
    </tr>
  );
};

export default CatalogReleaseRow;
