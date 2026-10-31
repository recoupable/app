import type { CatalogStreamComparisonData } from "@/lib/catalog/parseCatalogStreamComparison";

const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const signed = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  signDisplay: "exceptZero",
});
const reasons = {
  incomplete: "Missing daily observations",
  invalid_observation: "Invalid observations",
  unfinished_period: "Period not complete",
};

export default function CatalogStreamComparisonRow({
  row,
}: {
  row: CatalogStreamComparisonData["recordings"][number];
}) {
  return (
    <tr className="border-t align-top">
      <th scope="row" className="p-3 text-left font-normal">
        <div className="font-medium">{row.name || "Unnamed recording"}</div>
        <div className="font-mono text-xs text-muted-foreground">
          ISRC: {row.isrc}
        </div>
        <details className="mt-2 text-xs text-muted-foreground">
          <summary className="cursor-pointer">Source details</summary>
          <p>
            Provider recording: {row.provider_recording_id ?? "Not supplied"}
          </p>
          <p>Retrieved: {row.retrieved_at ?? "Unknown"}</p>
          {row.missing_days.length > 0 && (
            <p>Missing UTC dates: {row.missing_days.join(", ")}</p>
          )}
        </details>
      </th>
      {row.state === "comparable" ? (
        <>
          <td className="p-3 text-right tabular-nums">
            {number.format(row.previous_streams!)}
          </td>
          <td className="p-3 text-right tabular-nums">
            {number.format(row.current_streams!)}
          </td>
          <td className="p-3 text-right tabular-nums">
            {signed.format(row.absolute_growth!)}
          </td>
          <td className="p-3 text-right tabular-nums">
            {row.zero_baseline
              ? "Not defined (zero baseline)"
              : `${signed.format(row.percentage_growth!)}%`}
          </td>
        </>
      ) : (
        <td colSpan={4} className="p-3 text-muted-foreground">
          Comparison unavailable: {reasons[row.state]}.
          {row.missing_days.length > 0 &&
            ` ${row.missing_days.length} missing UTC ${row.missing_days.length === 1 ? "date" : "dates"}; missing values are not zero.`}
        </td>
      )}
    </tr>
  );
}
