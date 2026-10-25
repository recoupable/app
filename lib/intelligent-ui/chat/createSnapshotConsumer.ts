import type { UIMessage, UIMessageChunk } from "ai";
import { surfaceSchema, type Surface } from "../schema";
import { SURFACE_STREAM_LIMITS } from "../streamLimits";
import { getAnswerText } from "../presentation/getAnswerText";
import { isChatIntelligentUIEnabled } from "./isChatIntelligentUIEnabled";
import {
  getSnapshotScopeKey,
  type SnapshotHostScope,
} from "./getSnapshotScopeKey";

const SNAPSHOT_TYPE = "data-intelligent-ui-snapshot";
const MAX_RETAINED_MESSAGES = 16;

interface AcceptedSnapshot {
  surface: Surface;
  bytes: number;
}

export interface ChatSnapshotBinding {
  consumer: ReturnType<typeof createSnapshotConsumer>;
  scopeKey: string;
}

interface SnapshotStreamOptions {
  signal?: AbortSignal;
  messageId?: string;
  getMessages?: () => UIMessage[];
}

/**
 * Owned by the normal chat transport. Only full, validated snapshots reach the
 * SDK's stable-ID replacement. The workflow's upstream cursor still counts every
 * original chunk, including rejected UI candidates.
 */
export function createSnapshotConsumer(
  getScope: () => SnapshotHostScope | undefined,
) {
  let boundScope: string | undefined;
  let scopeIdentity: string | undefined;
  let hostSubjectIdentity: string | undefined;
  let scopeEpoch = 0;
  let generation = 0;
  let intentEpoch = 0;
  let pendingAbort: AbortController | undefined;
  let disposed = false;
  let retainedBytes = 0;
  const accepted = new Map<string, AcceptedSnapshot>();
  const boundMessageIds = new Set<string>();
  let hydratedTailId: string | undefined;
  let historicalText = new WeakMap<
    object,
    { messageId: string; surfaceId: string; revision: number; text: string }
  >();

  const subjectIdentity = (scope: SnapshotHostScope | undefined) =>
    scope
      ? JSON.stringify([
          scope.actorId,
          scope.accountId,
          scope.workspaceId,
          scope.subject.kind,
          scope.subject.id,
          ...(scope.workspaceKind !== undefined ? [scope.workspaceKind] : []),
          ...(scope.queryKey !== undefined
            ? [{ queryKey: scope.queryKey }]
            : []),
        ])
      : undefined;

  const invalidate = () => {
    generation++;
    pendingAbort?.abort();
    pendingAbort = undefined;
  };
  const invalidateIntent = () => {
    intentEpoch++;
    invalidate();
  };

  const completeScope = (proposed: SnapshotHostScope | undefined) =>
    proposed &&
    proposed.actorId &&
    proposed.accountId &&
    proposed.workspaceId &&
    proposed.sessionId &&
    proposed.chatId &&
    proposed.subject.kind &&
    proposed.subject.id
      ? proposed
      : undefined;

  // Rendering may inspect a prospective scope which React never commits. Its
  // next key is deterministic, but reading it must not advance the epoch or
  // abort/clear the currently committed scope.
  const getBindingKey = (proposed: SnapshotHostScope | undefined) => {
    const scope = isChatIntelligentUIEnabled()
      ? completeScope(proposed)
      : undefined;
    const identity = scope ? getSnapshotScopeKey(scope) : undefined;
    return identity
      ? identity === scopeIdentity
        ? boundScope
        : `${identity}:${scopeEpoch + 1}`
      : undefined;
  };
  const isCurrentBinding = (key: string) =>
    !disposed && boundScope === key && getBindingKey(getScope()) === key;

  const syncScope = () => {
    if (disposed) return { scope: undefined, key: undefined };
    const proposed = isChatIntelligentUIEnabled() ? getScope() : undefined;
    const proposedSubject = subjectIdentity(proposed);
    if (hostSubjectIdentity && hostSubjectIdentity !== proposedSubject)
      invalidateIntent();
    hostSubjectIdentity = proposedSubject;
    const scope = completeScope(proposed);
    const identity = scope ? getSnapshotScopeKey(scope) : undefined;
    if (identity !== scopeIdentity) {
      // Becoming ready may complete a pending first send. Replacing an already
      // bound session/chat invalidates pending operations as well as live ones.
      if (scopeIdentity) invalidateIntent();
      scopeIdentity = identity;
      boundScope = identity ? `${identity}:${++scopeEpoch}` : undefined;
      accepted.clear();
      boundMessageIds.clear();
      hydratedTailId = undefined;
      retainedBytes = 0;
      historicalText = new WeakMap();
    }
    return { scope, key: boundScope };
  };

  const bindMessage = (messageId: string) => {
    boundMessageIds.delete(messageId);
    boundMessageIds.add(messageId);
    if (boundMessageIds.size > MAX_RETAINED_MESSAGES)
      boundMessageIds.delete(boundMessageIds.values().next().value!);
  };

  const parseCandidate = (part: unknown, scope: SnapshotHostScope) => {
    if (
      !part ||
      typeof part !== "object" ||
      !("type" in part) ||
      part.type !== SNAPSHOT_TYPE
    )
      return undefined;
    let json: string;
    try {
      json = JSON.stringify(part);
    } catch {
      return undefined;
    }
    // The SDK has already decoded the SSE JSON. Bound our own validation and
    // retention; this is not a claim to bound the SDK's upstream raw parser.
    if (json.length > SURFACE_STREAM_LIMITS.lineBytes)
      return { bytes: SURFACE_STREAM_LIMITS.lineBytes + 1 };
    const bytes = new TextEncoder().encode(json).byteLength;
    if (
      bytes > SURFACE_STREAM_LIMITS.lineBytes ||
      !("data" in part) ||
      !("id" in part)
    )
      return { bytes };
    const parsed = surfaceSchema.safeParse(part.data);
    if (!parsed.success) return { bytes };
    const surface = parsed.data;
    if (
      part.id !== surface.id ||
      ("transient" in part && part.transient !== false) ||
      surface.context.workspaceId !== scope.workspaceId ||
      surface.context.subject.kind !== scope.subject.kind ||
      surface.context.subject.id !== scope.subject.id
    )
      return { bytes };
    return { bytes, candidate: { surface, bytes } };
  };

  const accept = (messageId: string, candidate: AcceptedSnapshot) => {
    const previous = accepted.get(messageId);
    // One coherent Surface owns this assistant response. Switching its stable
    // identity is not an update and must not mount a second unsolicited UI.
    if (
      previous &&
      (previous.surface.id !== candidate.surface.id ||
        previous.surface.revision >= candidate.surface.revision)
    )
      return false;
    retainedBytes += candidate.bytes - (previous?.bytes ?? 0);
    accepted.delete(messageId);
    accepted.set(messageId, candidate);
    bindMessage(messageId);
    while (
      accepted.size > MAX_RETAINED_MESSAGES ||
      retainedBytes > SURFACE_STREAM_LIMITS.totalBytes
    ) {
      const oldest = accepted.keys().next().value;
      if (oldest === undefined) break;
      retainedBytes -= accepted.get(oldest)!.bytes;
      accepted.delete(oldest);
    }
    return true;
  };

  const prepareStream = ({
    signal,
    messageId,
    getMessages,
  }: SnapshotStreamOptions = {}) => {
    const { key: intentScope } = syncScope();
    const proposed = getScope();
    // A pending workspace can supply actor/subject identity before its session
    // exists. Provisioning may fill session/chat IDs, never replace that actor.
    const intentSubject = subjectIdentity(proposed);
    invalidate();
    const abort = new AbortController();
    pendingAbort = abort;
    const streamGeneration = generation;
    let streamScope: string | undefined;
    let bound = false;
    let currentMessageId = messageId;
    let events = 0;
    let bytes = 0;
    const active = () => {
      const state = syncScope();
      return state.scope &&
        streamScope &&
        state.key === streamScope &&
        generation === streamGeneration &&
        !signal?.aborted
        ? state.scope
        : undefined;
    };
    const readFloor = () => {
      const message = getMessages?.().find(
        (item) => item.id === currentMessageId,
      );
      if (!message) return undefined;
      for (const part of message.parts) {
        if (
          part.type !== SNAPSHOT_TYPE ||
          !("data" in part) ||
          !part.data ||
          typeof part.data !== "object"
        )
          continue;
        const floor = historicalText.get(part.data);
        if (floor?.messageId === currentMessageId) return floor;
      }
      return undefined;
    };
    const resolveHistoryTarget = () => {
      const messages = getMessages?.();
      const last = messages?.at(-1);
      if (last)
        return last.role === "assistant" && boundMessageIds.has(last.id)
          ? last.id
          : undefined;
      // hydrate precedes setMessages, whose React getter can lag until commit.
      return hydratedTailId && boundMessageIds.has(hydratedTailId)
        ? hydratedTailId
        : undefined;
    };
    return {
      signal: abort.signal,
      /** Called once when the actual request IDs are selected, after provisioning. */
      bind(ids?: { chatId: string; sessionId?: string }) {
        if (bound) return;
        bound = true;
        const { scope, key } = syncScope();
        if (
          !scope ||
          generation !== streamGeneration ||
          signal?.aborted ||
          (intentScope && intentScope !== key) ||
          (intentSubject && intentSubject !== subjectIdentity(scope)) ||
          (ids &&
            (ids.chatId !== scope.chatId || ids.sessionId !== scope.sessionId))
        )
          return;
        streamScope = key;
      },
      filter(chunk: UIMessageChunk): UIMessageChunk | undefined {
        if (chunk.type === "start") {
          currentMessageId = chunk.messageId ?? currentMessageId;
          if (currentMessageId && active()) bindMessage(currentMessageId);
        }
        if (chunk.type !== SNAPSHOT_TYPE) return chunk;
        const scope = active();
        if (!scope) return undefined;
        currentMessageId ??= resolveHistoryTarget();
        if (
          !currentMessageId ||
          ++events > SURFACE_STREAM_LIMITS.events ||
          bytes >= SURFACE_STREAM_LIMITS.totalBytes
        )
          return undefined;
        const parsed = parseCandidate(chunk, scope);
        // Invalid/oversized candidates also consume the stream's bounded budget.
        bytes += parsed?.bytes ?? SURFACE_STREAM_LIMITS.lineBytes;
        const candidate = parsed?.candidate;
        const floor = readFloor();
        if (
          bytes > SURFACE_STREAM_LIMITS.totalBytes ||
          !candidate ||
          (floor &&
            (floor.surfaceId !== candidate.surface.id ||
              floor.revision >= candidate.surface.revision)) ||
          !accept(currentMessageId, candidate)
        )
          return undefined;
        return {
          type: SNAPSHOT_TYPE,
          id: candidate.surface.id,
          data: candidate.surface,
        };
      },
    };
  };

  return {
    getBindingKey,
    /** Stable local-view identity, available only for the current live binding.
     * This is not a content cache or an authorization grant.
     */
    getStateScope(scopeKey: string) {
      return isCurrentBinding(scopeKey) ? scopeIdentity : undefined;
    },
    syncScope,
    /** Capture before hook preparation; an SDK start must not expire its own cleanup. */
    captureSendIntent() {
      if (!isChatIntelligentUIEnabled()) return () => true;
      syncScope();
      const epoch = intentEpoch;
      const subject = subjectIdentity(getScope());
      return () => {
        syncScope();
        return (
          !disposed &&
          isChatIntelligentUIEnabled() &&
          epoch === intentEpoch &&
          subject === subjectIdentity(getScope())
        );
      };
    },
    /** Capture this key with a history request; a late previous-scope load cannot seed UI. */
    hydrate(messages: UIMessage[], scopeKey: string) {
      const { scope, key } = syncScope();
      if (!scope || key !== scopeKey) return messages;
      const tail = messages.at(-1);
      hydratedTailId = tail?.role === "assistant" ? tail.id : undefined;
      return messages.map((message) => {
        if (message.role !== "assistant") return message;
        bindMessage(message.id);
        let messageSurfaceId: string | undefined;
        let latest: AcceptedSnapshot | undefined;
        let snapshotIndex: number | undefined;
        const parts: UIMessage["parts"] = [];
        for (const part of message.parts) {
          if (part.type !== SNAPSHOT_TYPE) {
            parts.push(part);
            continue;
          }
          const candidate = parseCandidate(part, scope)?.candidate;
          if (
            !candidate ||
            (messageSurfaceId && messageSurfaceId !== candidate.surface.id)
          )
            continue;
          messageSurfaceId = candidate.surface.id;
          snapshotIndex ??= parts.length;
          if (!latest || candidate.surface.revision > latest.surface.revision)
            latest = candidate;
        }
        if (!latest) return { ...message, parts };
        accept(message.id, latest);
        const retained = accepted.get(message.id) ?? latest;
        historicalText.set(retained.surface, {
          messageId: message.id,
          surfaceId: retained.surface.id,
          revision: retained.surface.revision,
          text: getAnswerText(retained.surface),
        });
        parts.splice(snapshotIndex ?? parts.length, 0, {
          type: SNAPSHOT_TYPE,
          id: retained.surface.id,
          data: retained.surface,
        });
        return { ...message, parts };
      });
    },
    /** The SDK clones streamed messages. Bind only clones of already accepted responses. */
    observeMessages(messages: UIMessage[], scopeKey: string) {
      if (syncScope().key !== scopeKey) return;
      for (const message of messages.slice(-MAX_RETAINED_MESSAGES)) {
        const retained = accepted.get(message.id)?.surface;
        if (!retained) continue;
        for (const part of message.parts) {
          if (
            part.type === SNAPSHOT_TYPE &&
            "id" in part &&
            part.id === retained.id &&
            "data" in part &&
            part.data &&
            typeof part.data === "object"
          )
            historicalText.set(part.data, {
              messageId: message.id,
              surfaceId: retained.id,
              revision: retained.revision,
              text: getAnswerText(retained),
            });
        }
      }
    },
    getFallback(messageId: string, part: unknown, scopeKey: string) {
      if (
        !isCurrentBinding(scopeKey) ||
        !part ||
        typeof part !== "object" ||
        !("data" in part) ||
        !part.data ||
        typeof part.data !== "object"
      )
        return undefined;
      const fallback = historicalText.get(part.data);
      return fallback?.messageId === messageId &&
        "id" in part &&
        fallback.surfaceId === part.id
        ? fallback.text
        : undefined;
    },
    getSnapshot(messageId: string, surfaceId: string, scopeKey: string) {
      if (!isCurrentBinding(scopeKey)) return undefined;
      const surface = accepted.get(messageId)?.surface;
      return surface?.id === surfaceId ? surface : undefined;
    },
    /** Cancellation retains accepted content, but invalidates every in-flight token. */
    cancel() {
      invalidateIntent();
    },
    dispose() {
      disposed = true;
      invalidateIntent();
    },
    activate() {
      disposed = false;
      syncScope();
    },
    prepareStream,
    beginStream(options: SnapshotStreamOptions = {}) {
      const stream = prepareStream(options);
      stream.bind();
      return stream.filter;
    },
  };
}
