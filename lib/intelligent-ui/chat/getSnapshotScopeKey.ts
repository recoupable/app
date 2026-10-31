export interface SnapshotHostScope {
  actorId: string;
  accountId: string;
  workspaceId: string;
  /** Optional host namespace; the reusable consumer does not infer its meaning. */
  workspaceKind?: string;
  /** Opaque normalized host query identity; not source or authorization proof. */
  queryKey?: string;
  sessionId: string;
  chatId: string;
  subject: { kind: string; id: string };
}

/** A lifecycle/cache identity supplied by the host, never an authorization grant. */
export function getSnapshotScopeKey(scope: SnapshotHostScope): string {
  return JSON.stringify([
    scope.actorId,
    scope.accountId,
    scope.workspaceId,
    scope.sessionId,
    scope.chatId,
    scope.subject.kind,
    scope.subject.id,
    ...(scope.workspaceKind !== undefined ? [scope.workspaceKind] : []),
    ...(scope.queryKey !== undefined ? [{ queryKey: scope.queryKey }] : []),
  ]);
}
