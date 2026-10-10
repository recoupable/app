"use client";
import { Button } from "@/components/ui/button";
import { useExecutionTrace } from "@/hooks/useExecutionTrace";
import { buildExecutionNodeRows } from "@/lib/releases/buildExecutionNodeRows";
import ReleaseExecutionNodes from "./ReleaseExecutionNodes";
interface Props {
  requestId: string;
  organizationId: string | null;
  getAccessToken: () => Promise<string | null>;
}
/**
 * Reviewer panel for saved execution traces. It reads only through the shared
 * list_executions and read_execution operations, so opening a trace can never
 * retry a node, dispatch a provider or spend credits.
 */
export default function ReleaseExecutionTrace({
  requestId,
  organizationId,
  getAccessToken,
}: Props) {
  const traces = useExecutionTrace(requestId, organizationId, getAccessToken);
  return (
    <section
      className="space-y-4 rounded-2xl bg-background p-6 shadow-[0_0_0_1px_var(--border)]"
      aria-label="Execution traces"
    >
      <h2 className="text-lg font-semibold">Execution traces</h2>
      <p className="text-sm text-muted-foreground">
        Compare the planned workflow with what each saved run claimed and
        recorded for this request. Reading a trace never retries work, spends
        credits or grants collection.
      </p>
      <Button
        variant="outline"
        disabled={traces.busy}
        onClick={() => void traces.list()}
      >
        Load executions
      </Button>
      {traces.executions?.length === 0 && (
        <p role="status" className="text-sm">
          No recorded executions for this request.
        </p>
      )}
      {!!traces.executions?.length && (
        <ul className="space-y-2" aria-label="Recorded executions">
          {traces.executions.map((execution) => (
            <li
              key={execution.executionId}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-muted/50 px-4 py-3 text-sm"
            >
              <div className="min-w-0">
                <p className="font-medium">{execution.policyVersion}</p>
                <p className="text-xs text-muted-foreground">
                  Created {new Date(execution.createdAt).toLocaleString()} ·{" "}
                  {execution.outcomeCount} of {execution.nodeCount} nodes
                  recorded
                </p>
                <code className="break-all text-xs text-muted-foreground">
                  {execution.executionId}
                </code>
              </div>
              <Button
                size="sm"
                variant={
                  traces.trace?.id === execution.executionId
                    ? "default"
                    : "outline"
                }
                disabled={traces.busy}
                aria-label={`Open trace ${execution.executionId}`}
                onClick={() => void traces.open(execution.executionId)}
              >
                Open trace
              </Button>
            </li>
          ))}
        </ul>
      )}
      {traces.trace && (
        <ReleaseExecutionNodes rows={buildExecutionNodeRows(traces.trace)} />
      )}
      {traces.notice && (
        <p role="status" className="text-sm">
          {traces.notice}
        </p>
      )}
    </section>
  );
}
