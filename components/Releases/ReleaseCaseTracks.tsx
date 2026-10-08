import type { ReleaseCase } from "@/lib/releases/types";
export default function ReleaseCaseTracks({
  current,
}: {
  current: ReleaseCase;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <caption className="pb-3 text-left font-medium">
          Recording observations
        </caption>
        <thead>
          <tr>
            <th scope="col" className="p-2">
              Track
            </th>
            <th scope="col" className="p-2">
              Performing artists
            </th>
            <th scope="col" className="p-2">
              Recording identity
            </th>
          </tr>
        </thead>
        <tbody>
          {current.tracks.map((track) => {
            const identity = current.identity_observations.candidates.find(
              (x) => x.slotIndex === track.slot_index,
            );
            return (
              <tr key={track.slot_index}>
                <td className="p-2">
                  {track.track_number ?? track.slot_index + 1}.{" "}
                  {track.title ?? "Title unavailable"}
                </td>
                <td className="p-2">
                  {track.credited_artists.map((x) => x.name).join(", ") ||
                    "Not collected"}
                </td>
                <td className="p-2">
                  {identity?.isrc ?? "ISRC not collected"}
                  <span className="block text-muted-foreground">
                    {identity?.mappingState.replaceAll("_", " ") ??
                      "Unresolved"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
