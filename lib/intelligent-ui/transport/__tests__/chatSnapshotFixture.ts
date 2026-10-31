import type { SnapshotHostScope } from "../../chat/getSnapshotScopeKey";
import { snapshotPart } from "./snapshotPart";

export const hostScope: SnapshotHostScope = {
  actorId: "synthetic-actor",
  accountId: "synthetic-account",
  workspaceId: "synthetic-workspace",
  sessionId: "synthetic-session",
  chatId: "synthetic-chat",
  subject: { kind: "artist", id: "synthetic-artist" },
};

export function chatSnapshotPart(
  revision: number,
  text = `Version ${revision}`,
) {
  const part = snapshotPart(revision, text);
  part.data.context = {
    workspaceId: hostScope.workspaceId,
    subject: { ...hostScope.subject, label: "Synthetic artist" },
  };
  return part;
}
