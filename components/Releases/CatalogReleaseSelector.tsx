import type { CatalogStreamRelease } from "@/lib/releases/catalogStreamTypes";
export default function CatalogReleaseSelector({
  releases,
  selectedId,
  songCount,
  onSelect,
}: {
  releases: CatalogStreamRelease[];
  selectedId: string;
  songCount: number;
  onSelect: (id: string) => void;
}) {
  return (
    <select
      aria-label="Release"
      className="h-11 max-w-full rounded-lg bg-background pl-3 pr-8 text-sm shadow-[0_0_0_1px_var(--input)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-10"
      value={selectedId}
      onChange={(event) => onSelect(event.target.value)}
    >
      <option value="">All releases · {songCount} songs</option>
      {releases.map((release) => (
        <option key={release.id} value={release.id}>
          {release.title} · {release.recordings.length} songs
        </option>
      ))}
    </select>
  );
}
