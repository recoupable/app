import type {
  ExecutionNodeRow,
  ExecutionTrace,
  PlanNodeState,
} from "./executionTypes";
const IMPLEMENTATION: Record<
  PlanNodeState,
  ExecutionNodeRow["implementation"]
> = {
  ready_for_dispatch: "implemented",
  reuse_candidate: "implemented",
  blocked: "blocked by policy",
  not_implemented: "template",
};
/**
 * Join the immutable plan with recorded outcomes and claims, in plan order.
 * Nothing is inferred: a missing outcome stays unknown or not_started, and
 * cost, prompts and durations are reported as unrecorded rather than zero.
 */
export function buildExecutionNodeRows(
  trace: ExecutionTrace,
): ExecutionNodeRow[] {
  const outcomes = new Map(
    trace.outcomes.map((record) => [record.node_key, record]),
  );
  const claims = new Map(trace.claims.map((claim) => [claim.nodeKey, claim]));
  return trace.plan.map((node) => {
    const record = outcomes.get(node.key);
    const claim = claims.get(node.key);
    const reviewState =
      record?.outcome.status ?? (claim ? "unknown" : "not_started");
    const missing = [
      ...(record
        ? []
        : [
            claim
              ? "No outcome recorded; reconcile the claim before any retry."
              : "No claim or outcome recorded.",
          ]),
      "No prompts recorded for this node.",
      "No cost recorded; cost is unknown, not zero.",
    ];
    return {
      key: node.key,
      subjectId: node.subjectId,
      module: node.module,
      planState: node.state,
      implementation: IMPLEMENTATION[node.state],
      reviewState,
      reviewLabel:
        reviewState === "unknown"
          ? "unknown (claimed, needs reconciliation)"
          : reviewState,
      dependsOn: node.dependsOn,
      blockedBy: record?.outcome.blockedBy ?? [],
      blockReason: record?.outcome.blockReason,
      reasons: record?.outcome.reasons ?? [],
      failureStage: record?.outcome.failureStage,
      resultId: record?.outcome.receipt?.resultId,
      claimedAt: claim?.claimedAt,
      recordedAt: record?.recorded_at,
      cost: "unknown",
      timing: "recorded timestamps only",
      missing,
    };
  });
}
