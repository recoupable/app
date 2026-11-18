import { Chat } from "@ai-sdk/react";
import type { ChatInit, ChatRequestOptions, UIMessage } from "ai";
import { readResumedMessages } from "./readResumedMessages";

type Options = Pick<
  ChatInit<UIMessage>,
  "id" | "messages" | "generateId" | "onData" | "onError" | "onFinish"
> & {
  transport: NonNullable<ChatInit<UIMessage>["transport"]>;
  captureResumeScope?: () => () => boolean;
};

/** App-owned cold resume; ordinary sends/regeneration remain in the SDK.
 * Only exported/protected SDK extension APIs and the public message setter are
 * used. Workflow still owns HTTP reconnection, raw cursors and authentication.
 */
export class ResumableChat extends Chat<UIMessage> {
  private resume?: {
    controller: AbortController;
    done: Promise<void>;
    isScopeCurrent: () => boolean;
  };
  private resumeIntent = 0;
  private readonly options: Options;

  constructor(options: Options) {
    let markStreaming = () => {};
    super({
      ...options,
      transport: {
        ...options.transport,
        reconnectToStream: (request) =>
          options.transport.reconnectToStream(request),
        sendMessages: async (request) => {
          const isCurrent = options.captureResumeScope?.() ?? (() => true);
          const stream = await options.transport.sendMessages(request);
          return stream.pipeThrough(
            new TransformStream({
              transform(chunk, output) {
                // Preserve the app's admitted-stream feedback before the first text
                // token. SDK 7 otherwise remains submitted after a start-only chunk.
                if (!request.abortSignal?.aborted && isCurrent())
                  markStreaming();
                output.enqueue(chunk);
              },
            }),
          );
        },
      },
    });
    markStreaming = () => this.setStatus({ status: "streaming" });
    this.options = options;
    const sdkStop = this.stop;
    this.stop = async () => {
      this.resumeIntent++;
      const resume = this.resume;
      resume?.controller.abort();
      await sdkStop();
      await resume?.done;
    };
    const sdkSend = this.sendMessage;
    this.sendMessage = async (...args) => {
      if (this.resume) await this.stop();
      return sdkSend(...args);
    };
    const sdkRegenerate = this.regenerate;
    this.regenerate = async (...args) => {
      if (this.resume) await this.stop();
      return sdkRegenerate(...args);
    };
  }

  override resumeStream = (request?: ChatRequestOptions): Promise<void> => {
    const isScopeCurrent = this.options.captureResumeScope?.() ?? (() => true);
    const previous = this.resume;
    if (previous) {
      if (previous.isScopeCurrent() && !previous.controller.signal.aborted)
        return previous.done;
      const intent = ++this.resumeIntent;
      previous.controller.abort();
      return previous.done.then(() => {
        if (intent === this.resumeIntent && isScopeCurrent())
          return this.resumeStream(request);
      });
    }
    if (!isScopeCurrent()) return Promise.resolve();
    if (this.status === "submitted" || this.status === "streaming")
      return Promise.resolve();
    const controller = new AbortController();
    const current = () => !controller.signal.aborted && isScopeCurrent();
    const run = async () => {
      let latest: UIMessage | undefined;
      let finishReason: Parameters<
        NonNullable<Options["onFinish"]>
      >[0]["finishReason"];
      let failed = false;
      let isDisconnect = false;
      let ownershipCaptured = false;
      const ownedIds = new Set<string>();
      const checkMessageId = (id: string) => {
        if (
          this.messages.some((message) => message.id === id) &&
          !ownedIds.has(id)
        )
          throw new Error(
            "Resumed message ID conflicts with unrelated history",
          );
      };
      try {
        if (!current()) return;
        this.setStatus({ status: "submitted", error: undefined });
        const stream = await this.options.transport.reconnectToStream({
          ...request,
          chatId: this.id,
          abortSignal: controller.signal,
        });
        if (!stream) return;
        if (!current()) {
          controller.abort();
          await stream.cancel();
          return;
        }
        for await (const message of readResumedMessages({
          stream,
          controller,
          generateId: this.generateId,
          // The transport settles its first filtered byte before this read;
          // committed history can arrive while the HTTP request is pending.
          getSeed: () =>
            this.lastMessage?.role === "assistant"
              ? this.lastMessage
              : undefined,
          onChunk: (chunk) => {
            if (!current()) {
              controller.abort();
              return;
            }
            if (!ownershipCaptured) {
              ownershipCaptured = true;
              if (this.lastMessage?.role === "assistant")
                ownedIds.add(this.lastMessage.id);
            }
            if (chunk.type === "start" && chunk.messageId)
              checkMessageId(chunk.messageId);
            this.setStatus({ status: "streaming" });
            if ("data" in chunk) this.options.onData?.(chunk);
            if (chunk.type === "finish") finishReason = chunk.finishReason;
          },
        })) {
          if (!current()) {
            controller.abort();
            break;
          }
          checkMessageId(message.id);
          ownedIds.add(message.id);
          latest = message;
          const index = this.messages.findIndex(
            (item) => item.id === message.id,
          );
          this.messages =
            index < 0
              ? [...this.messages, message]
              : this.messages.map((item, position) =>
                  position === index ? message : item,
                );
        }
      } catch (error) {
        // A fatal parser error aborts upstream too; its reason is the error,
        // unlike an expected scope/Stop abort.
        failed =
          !controller.signal.aborted ||
          !(
            controller.signal.reason instanceof DOMException &&
            controller.signal.reason.name === "AbortError"
          );
        isDisconnect =
          failed &&
          error instanceof TypeError &&
          (error.message.toLowerCase().includes("fetch") ||
            error.message.toLowerCase().includes("network"));
        if (failed && isScopeCurrent()) {
          const cause =
            error instanceof Error ? error : new Error(String(error));
          this.setStatus({ status: "error", error: cause });
          this.options.onError?.(cause);
        }
        controller.abort(error);
      } finally {
        // This coordinator still owns the active operation even when its
        // audience changed. Release loading, but never run stale callbacks.
        if (
          this.resume?.controller === controller &&
          (!failed || !isScopeCurrent())
        )
          this.setStatus({ status: "ready", error: undefined });
        if (isScopeCurrent()) {
          if (latest)
            this.options.onFinish?.({
              message: latest,
              messages: this.messages,
              isAbort: controller.signal.aborted && !failed,
              isDisconnect,
              isError: failed,
              finishReason,
            });
        }
      }
    };
    const done = Promise.resolve()
      .then(run)
      .finally(() => {
        if (this.resume?.controller === controller) this.resume = undefined;
      });
    this.resume = { controller, done, isScopeCurrent };
    return done;
  };
}
