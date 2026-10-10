import type { StreamPoint } from "@/lib/releases/streamTypes";
export default function ReleaseStreamDailyValues({
  points,
}: {
  points: StreamPoint[];
}) {
  return (
    <details className="mt-2 text-xs text-muted-foreground">
      <summary className="w-fit cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        Daily values
      </summary>
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
    </details>
  );
}
