import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ExecutionNodeRow } from "@/lib/releases/executionTypes";
const LEGEND: ReadonlyArray<readonly [string, string]> = [
  [
    "template",
    "Planned module with no implementation; it is never dispatched.",
  ],
  [
    "implemented",
    "Implementation exists and the plan allowed a run or evidence reuse.",
  ],
  ["blocked by policy", "The plan refused this module. Blocked is not failed."],
  [
    "unknown (claimed, needs reconciliation)",
    "A run claimed the node but recorded no outcome. Reconcile it before any retry.",
  ],
  ["not_started", "Nothing was claimed or recorded for the node."],
];
const formatTime = (value?: string) =>
  value ? new Date(value).toLocaleString() : "not recorded";
export default function ReleaseExecutionNodes({
  rows,
}: {
  rows: ExecutionNodeRow[];
}) {
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl shadow-[0_0_0_1px_var(--border)]">
        <Table aria-label="Execution nodes">
          <TableHeader>
            <TableRow>
              <TableHead>Node</TableHead>
              <TableHead>Implementation</TableHead>
              <TableHead>Review state</TableHead>
              <TableHead>Depends on</TableHead>
              <TableHead>Recorded</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.key} className="align-top">
                <TableCell>
                  <p className="font-medium">{row.module}</p>
                  <code className="break-all text-xs text-muted-foreground">
                    {row.subjectId}
                  </code>
                </TableCell>
                <TableCell>{row.implementation}</TableCell>
                <TableCell>{row.reviewLabel}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {row.dependsOn.length
                    ? row.dependsOn.map((key) => (
                        <p key={key} className="break-all">
                          {key.split(":")[1] ?? key}
                        </p>
                      ))
                    : "none"}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  <p>Claimed {formatTime(row.claimedAt)}</p>
                  <p>Outcome {formatTime(row.recordedAt)}</p>
                </TableCell>
                <TableCell>{row.cost}</TableCell>
                <TableCell className="space-y-1 text-xs">
                  {row.blockReason && (
                    <p>Blocked: {row.blockReason.replaceAll("_", " ")}</p>
                  )}
                  {row.failureStage && <p>Failed at {row.failureStage}</p>}
                  {row.blockedBy.length > 0 && (
                    <p className="break-all">
                      Blocked by {row.blockedBy.join(", ")}
                    </p>
                  )}
                  {row.reasons.map((reason) => (
                    <p key={reason}>
                      <code>{reason}</code>
                    </p>
                  ))}
                  {row.resultId && (
                    <p>
                      Evidence <code className="break-all">{row.resultId}</code>
                    </p>
                  )}
                  <ul className="text-muted-foreground">
                    {row.missing.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <details className="rounded-xl bg-muted/30 px-4 py-3 text-sm">
        <summary className="cursor-pointer font-medium">
          What the states mean
        </summary>
        <dl className="mt-3 space-y-2">
          {LEGEND.map(([term, meaning]) => (
            <div key={term}>
              <dt className="font-medium">{term}</dt>
              <dd className="text-muted-foreground">{meaning}</dd>
            </div>
          ))}
        </dl>
      </details>
      <p className="text-xs text-muted-foreground">
        Reading a trace does not retry, dispatch or spend, and it grants no
        collection authority. Cost and prompts are not recorded for these nodes,
        so cost is unknown, not zero. Timings are the recorded claim and outcome
        timestamps only. Connected, fixture-tested and live-verified status is
        tracked in implementation tickets, not in this trace.
      </p>
    </div>
  );
}
