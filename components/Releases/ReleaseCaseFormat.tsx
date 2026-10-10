import type { ReleaseCase } from "@/lib/releases/types";
const FORMAT_LABELS: Record<string, string> = {
  single: "Single",
  album: "Album",
  compilation: "Compilation",
};
const count = (value: number, noun: string) =>
  `${value} ${noun}${value === 1 ? "" : "s"}`;
export default function ReleaseCaseFormat({
  current,
}: {
  current: ReleaseCase;
}) {
  const format = current.release_format;
  const className = "mt-1 text-sm text-muted-foreground";
  if (!format || format.state !== "observed")
    return <p className={className}>Format not collected</p>;
  // Only observed values are shown; nothing is inferred on the client.
  const parts = [
    FORMAT_LABELS[format.format_state] ?? "Format unknown",
    format.disc_count !== null
      ? count(format.disc_count, "disc")
      : format.multi_disc
        ? "Multiple discs"
        : "Disc count unknown",
    format.reported_total_tracks === null
      ? null
      : `${count(format.reported_total_tracks, "track")} reported`,
    format.track_coverage === "partial" ? "Track list incomplete" : null,
    format.release_date ? `Released ${format.release_date}` : null,
    format.label,
    format.upc_state === "observed" && format.upc
      ? `UPC ${format.upc}`
      : format.upc_state === "uncollected"
        ? "UPC not collected"
        : "UPC not observed",
    "Reissue/physical format unknown",
  ].filter((part): part is string => Boolean(part));
  return <p className={className}>{parts.join(" · ")}</p>;
}
