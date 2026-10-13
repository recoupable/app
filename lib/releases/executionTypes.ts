export type PlanNodeState =
  | "ready_for_dispatch"
  | "reuse_candidate"
  | "blocked"
  | "not_implemented";
export interface PlanNode {
  key: string;
  subjectId: string;
  module: string;
  state: PlanNodeState;
  dependsOn: string[];
}
export type ExecutionOutcomeStatus = "saved" | "reused" | "failed" | "blocked";
export interface ExecutionOutcome {
  key?: string;
  status: ExecutionOutcomeStatus;
  blockedBy?: string[];
  blockReason?: "plan_blocked" | "not_implemented" | "dependency_failed";
  reasons?: string[];
  failureStage?: "authorize" | "dispatch";
  receipt?: { state?: string; resultId: string };
}
export interface ExecutionOutcomeRecord {
  node_key: string;
  outcome: ExecutionOutcome;
  recorded_at: string;
}
/** `unknown` is a claim that recorded no outcome; it is never a success or a failure. */
export interface ExecutionClaim {
  nodeKey: string;
  claimedAt: string;
  state: ExecutionOutcomeStatus | "unknown";
}
export interface ExecutionSummary {
  executionId: string;
  policyVersion: string;
  createdAt: string;
  nodeCount: number;
  outcomeCount: number;
}
export interface ExecutionTrace {
  id: string;
  request_id: string;
  policy_version: string;
  created_at: string;
  plan: PlanNode[];
  outcomes: ExecutionOutcomeRecord[];
  claims: ExecutionClaim[];
}
export type ExecutionReviewState =
  | ExecutionOutcomeStatus
  | "unknown"
  | "not_started";
export interface ExecutionNodeRow {
  key: string;
  subjectId: string;
  module: string;
  planState: PlanNodeState;
  implementation: "template" | "implemented" | "blocked by policy";
  reviewState: ExecutionReviewState;
  reviewLabel: string;
  dependsOn: string[];
  blockedBy: string[];
  blockReason?: ExecutionOutcome["blockReason"];
  reasons: string[];
  failureStage?: ExecutionOutcome["failureStage"];
  resultId?: string;
  claimedAt?: string;
  recordedAt?: string;
  cost: "unknown";
  timing: "recorded timestamps only";
  missing: string[];
}
