import type { StreamPoint } from "@/lib/releases/streamTypes";
export default function ReleaseStreamDailyValues({
  points,
}: {
  points: StreamPoint[];
}) {
  return (
    <div className="text-xs text-muted-foreground">
      <div className="mt-3 max-h-60 overflow-auto">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">
            Daily streams, UTC dates. Missing values are unavailable.
          </caption>
          <thead>
            <tr>
              <th scope="col">Date (UTC)</th>
              <th scope="col" className="text-right">
                Streams
              </th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.date}>
                <th scope="row" className="py-1 font-normal">
                  {point.date}
                </th>
                <td className="text-right tabular-nums">
                  {point.streams?.toLocaleString("en-US") ?? "Unavailable"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
