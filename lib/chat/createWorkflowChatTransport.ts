import type { UIMessage, UIMessageChunk } from "ai";
import {
  createChatRequestLifecycle,
  type ChatRequestLifecycle,
  type ChatAdmissionMetadata,
} from "./createChatRequestLifecycle";
import {
  WorkflowChatTransport,
  type WorkflowChatTransportOptions,
} from "@workflow/ai";
import type { createSnapshotConsumer } from "@/lib/intelligent-ui/chat/createSnapshotConsumer";
import { settleSnapshotReconnect } from "@/lib/intelligent-ui/chat/settleSnapshotReconnect";
import type { CatalogSurfaceRequest } from "@/lib/intelligent-ui/chat/getChatCatalogHost";
import { isChatIntelligentUIEnabled } from "@/lib/intelligent-ui/chat/isChatIntelligentUIEnabled";

interface CreateWorkflowChatTransportOptions {
  /** recoup-api origin, e.g. `https://api.recoupable.dev`. */
  baseUrl: string;
  /** Reads the ids current as of the request, not as of transport construction. */
  getIds: () => { sessionId: string | undefined; chatId: string };
  /** Privy access token for both the POST and every reconnect. */
  getAccessToken: () => Promise<string | null>;
  /**
   * Resolves once the sandbox can take a request; rejects if provisioning
   * failed. A Send pressed while provisioning is a real message from the
   * first frame, and the request itself waits here (app#2052).
   */
  waitForWorkspace?: () => Promise<void>;
  /** Development-only experimental consumer; absent on the default production path. */
  snapshotConsumer?: ReturnType<typeof createSnapshotConsumer>;
  getMessages?: () => UIMessage[];
  /** Optional committed host references, never an authorization grant. */
  getDevCatalogSurface?: () => CatalogSurfaceRequest | undefined;
  requestLifecycle?: ChatRequestLifecycle;
  /** Capture the committed completion effect before this operation starts. */
  captureStreamEnd?: () => (() => unknown) | undefined;
}

/**
 * A chat transport that reconnects through a dropped stream on its own.
 *
 * `WorkflowChatTransport` is a single generator: it reads the POST stream,
 * and if that stream ends without a `finish` chunk it continues into
 * `while (!gotFinish)`, reissuing `GET {api}/…/stream?startIndex=N` with the
 * chunk index it has been counting all along. One continuous stream reaches
 * `useChat`, which therefore settles exactly when `finish` arrives.
 *
 * That structure is why we adopted it. Our hand-rolled equivalent tracked the
 * same state across React refs — an in-flight flag, an edge-detected trigger,
 * a probe schedule, a terminal-state branch — and each fix exposed another
 * unverified state: a trigger that fired once, a flag held across a 120s
 * connection, a final stream end that fired nothing. There is no trigger to
 * miss here, and no ref to hold (chat#1923).
 *
 * @param options - Api origin, live ids, and the token getter.
 * @returns A transport ready to hand to `useChat`.
 */
export function createWorkflowChatTransport<UI_MESSAGE extends UIMessage>({
  baseUrl,
  getIds,
  getAccessToken,
  waitForWorkspace,
  snapshotConsumer,
  getMessages,
  getDevCatalogSurface,
  requestLifecycle = createChatRequestLifecycle(),
  captureStreamEnd,
}: CreateWorkflowChatTransportOptions): WorkflowChatTransport<UI_MESSAGE> {
  let completionOwner = 0;
  const captureCompletion = (
    operation: ReturnType<ChatRequestLifecycle["begin"]>,
  ) => {
    const owner = ++completionOwner;
    const onStreamEnd = captureStreamEnd?.();
    let accepted = false;
    let finished = false;
    return {
      accept: () => {
        accepted = true;
      },
      finish: () => {
        if (finished) return;
        finished = true;
        operation.dispose();
        if (
          !accepted ||
          operation.controller.signal.aborted ||
          owner !== completionOwner
        )
          return;
        // Scope disposal aborts our controller; confirmed Stop aborts only the
        // reader. Credits still refresh for that accepted, stopped run.
        // Refresh failures must not affect the answer or operation cleanup.
        try {
          void Promise.resolve(onStreamEnd?.()).catch(() => {});
        } catch {}
      },
    };
  };
  const authHeaders = async (): Promise<Record<string, string>> => {
    const token = await getAccessToken();
    if (!token) throw new Error("Please sign in to resume this response");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };
  const filterStream = (
    stream: ReadableStream<UIMessageChunk> | null,
    filter?: (chunk: UIMessageChunk) => UIMessageChunk | undefined,
  ) =>
    stream && filter
      ? stream.pipeThrough(
          new TransformStream<UIMessageChunk, UIMessageChunk>({
            transform(chunk, controller) {
              const accepted = filter(chunk);
              if (accepted) controller.enqueue(accepted);
            },
          }),
        )
      : stream;

  const transportOptions = (
    operation: ReturnType<ChatRequestLifecycle["begin"]>,
    bind?: (ids: { chatId: string; sessionId?: string }) => void,
    signal?: AbortSignal,
    metadata?: ChatAdmissionMetadata,
    onStreamAccepted?: () => void,
  ): WorkflowChatTransportOptions<UI_MESSAGE> => {
    let ids: ReturnType<typeof getIds> | undefined;
    let admitted = false;
    const reject = (error: unknown) => {
      if (!admitted && metadata)
        metadata.onRejected(
          error instanceof Error ? error : new Error(String(error)),
        );
      operation.settle();
    };
    const check = () => {
      signal?.throwIfAborted();
      if (metadata && !admitted && !metadata.isCurrent())
        throw new DOMException("Cancelled", "AbortError");
    };
    return {
      api: `${baseUrl}/api/chat`,
      // The installed SDK appends ?startIndex itself. Add the lifecycle opt-in
      // here so its absolute cursor and negative-tail handling stay untouched.
      fetch: async (input, init) => {
        const url = new URL(String(input));
        url.searchParams.set("streamLifecycle", "explicit-stop-v1");
        try {
          check();
          // An active GET is already a reader, rather than pending send
          // preparation. Stop leaves it attached until the server confirms.
          operation.dispatched();
          const response = await fetch(url.toString(), init);
          if (init?.method !== "POST" && response.ok && response.body)
            onStreamAccepted?.();
          if (
            init?.method === "POST" &&
            response.ok &&
            (!response.body || !response.headers.get("x-workflow-run-id"))
          )
            operation.markUnknown();
          if (
            init?.method === "POST" &&
            (!response.ok ||
              !response.body ||
              !response.headers.get("x-workflow-run-id"))
          ) {
            reject(
              Object.assign(
                new Error(
                  response.ok
                    ? "Could not confirm message admission"
                    : "Message was not accepted",
                ),
                response.ok ? {} : { status: response.status },
              ),
            );
          }
          return response;
        } catch (error) {
          if (
            init?.method === "POST" &&
            !(error instanceof DOMException && error.name === "AbortError")
          )
            operation.markUnknown();
          reject(error);
          throw error;
        }
      },
      onChatSendMessage: () => {
        admitted = true;
        operation.admit();
        onStreamAccepted?.();
        operation.settle();
        if (ids) metadata?.onAccepted(ids);
      },
      prepareSendMessagesRequest: async ({ messages, body }) => {
        try {
          await waitForWorkspace?.();
          check();
          ids = getIds();
          bind?.(ids);
          const devCatalogSurface = isChatIntelligentUIEnabled()
            ? getDevCatalogSurface?.()
            : undefined;
          const requestBody = { ...body };
          delete requestBody.intelligentUI;
          delete requestBody.devCatalogSurface;
          const recoupAccessToken = await getAccessToken();
          check();
          if (!recoupAccessToken)
            throw new Error("Please sign in to send this message");
          return {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${recoupAccessToken}`,
            },
            body: {
              ...requestBody,
              messages,
              sessionId: ids.sessionId,
              chatId: ids.chatId,
              recoupAccessToken,
              ...(devCatalogSurface ? { devCatalogSurface } : {}),
            },
          };
        } catch (error) {
          reject(error);
          throw error;
        }
      },
      prepareReconnectToStreamRequest: async () => {
        ids ??= getIds();
        bind?.(ids);
        const headers = await authHeaders();
        check();
        return {
          api: `${baseUrl}/api/chat/${encodeURIComponent(ids.chatId)}/stream`,
          headers,
        };
      },
    };
  };
  const observeStream = (
    stream: ReadableStream<UIMessageChunk>,
    finish: () => void,
  ) => {
    const reader = stream.getReader();
    return new ReadableStream<UIMessageChunk>({
      async pull(controller) {
        try {
          const result = await reader.read();
          if (result.done) {
            finish();
            controller.close();
          } else controller.enqueue(result.value);
        } catch (error) {
          finish();
          controller.error(error);
        }
      },
      async cancel(reason) {
        finish();
        await reader.cancel(reason);
      },
    });
  };

  class RecoupChatTransport extends WorkflowChatTransport<UI_MESSAGE> {
    override async sendMessages(
      options: Parameters<WorkflowChatTransport<UI_MESSAGE>["sendMessages"]>[0],
    ) {
      const operation = requestLifecycle.begin();
      const completion = captureCompletion(operation);
      const pending = snapshotConsumer?.prepareStream({
        signal: options.abortSignal,
        getMessages,
      });
      const readerSignal = pending
        ? options.abortSignal
          ? AbortSignal.any([options.abortSignal, pending.signal])
          : pending.signal
        : options.abortSignal;
      const signal = AbortSignal.any([
        operation.controller.signal,
        operation.readerController.signal,
        ...(readerSignal ? [readerSignal] : []),
      ]);
      const candidate = options.metadata as
        | Partial<ChatAdmissionMetadata>
        | undefined;
      const metadata =
        candidate &&
        typeof candidate.isCurrent === "function" &&
        typeof candidate.onAccepted === "function" &&
        typeof candidate.onRejected === "function"
          ? (candidate as ChatAdmissionMetadata)
          : undefined;
      const stream = await new WorkflowChatTransport(
        transportOptions(
          operation,
          pending?.bind,
          signal,
          metadata,
          completion.accept,
        ),
      ).sendMessages({ ...options, abortSignal: signal });
      return observeStream(
        filterStream(stream, pending?.filter)!,
        completion.finish,
      );
    }

    /**
     * `204` is our api's "nothing to resume" answer, and it has no body — which
     * the transport surfaces as `Failed to fetch chat: 204` and counts toward
     * `maxConsecutiveErrors`. Treat it as the end of the road instead, matching
     * upstream open-agents' wrapper.
     */
    override async reconnectToStream(
      options: Parameters<
        WorkflowChatTransport<UI_MESSAGE>["reconnectToStream"]
      >[0],
    ) {
      try {
        const operation = requestLifecycle.begin();
        const completion = captureCompletion(operation);
        operation.settle();
        const pending = snapshotConsumer?.prepareStream({
          signal: options.abortSignal,
          getMessages,
        });
        const readerSignal = pending
          ? options.abortSignal
            ? AbortSignal.any([options.abortSignal, pending.signal])
            : pending.signal
          : options.abortSignal;
        const signal = AbortSignal.any([
          operation.controller.signal,
          operation.readerController.signal,
          ...(readerSignal ? [readerSignal] : []),
        ]);
        const stream = await new WorkflowChatTransport(
          transportOptions(
            operation,
            pending?.bind,
            signal,
            undefined,
            completion.accept,
          ),
        ).reconnectToStream({ ...options, abortSignal: signal });
        const filtered = filterStream(stream, pending?.filter);
        const observed = filtered && observeStream(filtered, completion.finish);
        return observed && pending
          ? await settleSnapshotReconnect(observed, pending.signal)
          : observed;
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.startsWith("Failed to fetch chat: 204")
        ) {
          return null;
        }
        throw error;
      }
    }
  }

  return new RecoupChatTransport();
}
