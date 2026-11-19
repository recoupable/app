import { Chat } from "@ai-sdk/react";
import {
  convertFileListToFileUIParts,
  type ChatInit,
  type ChatRequestOptions,
  type UIMessage,
  type UIMessageChunk,
} from "ai";
import { readResumedMessages } from "./readResumedMessages";

type Options = Pick<
  ChatInit<UIMessage>,
  "id" | "messages" | "generateId" | "onData" | "onError" | "onFinish"
> & {
  transport: NonNullable<ChatInit<UIMessage>["transport"]>;
  captureResumeScope?: () => () => boolean;
};

/** App-owned message assembly shared by send, regeneration and cold resume.
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
    super(options);
    this.options = options;
    const sdkStop = this.stop;
    this.stop = async () => {
      this.resumeIntent++;
      const resume = this.resume;
      resume?.controller.abort();
      await sdkStop();
      await resume?.done;
    };
  }

  override sendMessage: Chat<UIMessage>["sendMessage"] = async (
    message,
    request,
  ) => {
    const isScopeCurrent = this.options.captureResumeScope?.() ?? (() => true);
    if (!isScopeCurrent()) return;
    const intent = ++this.resumeIntent;
    const previous = this.resume;
    if (previous) {
      previous.controller.abort();
      await previous.done;
    }
    if (intent !== this.resumeIntent || !isScopeCurrent()) return;
    if (message != null) {
      let parts: UIMessage["parts"];
      if ("text" in message || "files" in message) {
        const files = Array.isArray(message.files)
          ? message.files
          : await convertFileListToFileUIParts(message.files);
        parts = [
          ...files,
          ...("text" in message && message.text != null
            ? [{ type: "text" as const, text: message.text }]
            : []),
        ];
      } else parts = message.parts;
      if (intent !== this.resumeIntent || !isScopeCurrent()) return;
      const prepared: UIMessage = {
        id:
          message.messageId ??
          ("id" in message ? message.id : undefined) ??
          this.generateId(),
        role: ("role" in message ? message.role : undefined) ?? "user",
        parts,
        metadata: message.metadata,
      };
      if (message.messageId != null) {
        const index = this.messages.findIndex(
          (item) => item.id === message.messageId,
        );
        if (index < 0 || this.messages[index].role !== "user")
          throw new Error(
            "Edited message must identify an existing user message",
          );
        this.messages = [...this.messages.slice(0, index), prepared];
      } else this.messages = [...this.messages, prepared];
    }
    if (intent !== this.resumeIntent || !isScopeCurrent()) return;
    return this.consumeStream(
      (signal) =>
        this.options.transport.sendMessages({
          ...request,
          chatId: this.id,
          messages: this.messages,
          abortSignal: signal,
          trigger: "submit-message",
          messageId:
            message?.messageId ??
            (message == null ? this.lastMessage?.id : undefined),
        }),
      isScopeCurrent,
    );
  };

  override regenerate: Chat<UIMessage>["regenerate"] = async ({
    messageId,
    ...request
  } = {}) => {
    const isScopeCurrent = this.options.captureResumeScope?.() ?? (() => true);
    if (!isScopeCurrent()) return;
    const intent = ++this.resumeIntent;
    const previous = this.resume;
    if (previous) {
      previous.controller.abort();
      await previous.done;
    }
    if (intent !== this.resumeIntent || !isScopeCurrent()) return;
    const index =
      messageId == null
        ? this.messages.length - 1
        : this.messages.findIndex((item) => item.id === messageId);
    if (index < 0) throw new Error("Message to regenerate was not found");
    this.messages = this.messages.slice(
      0,
      this.messages[index].role === "assistant" ? index : index + 1,
    );
    return this.consumeStream(
      (signal) =>
        this.options.transport.sendMessages({
          ...request,
          chatId: this.id,
          messages: this.messages,
          abortSignal: signal,
          trigger: "regenerate-message",
          messageId,
        }),
      isScopeCurrent,
    );
  };

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
    this.resumeIntent++;
    return this.consumeStream(
      (signal) =>
        this.options.transport.reconnectToStream({
          ...request,
          chatId: this.id,
          abortSignal: signal,
        }),
      isScopeCurrent,
    );
  };

  private consumeStream(
    open: (
      signal: AbortSignal,
    ) => Promise<ReadableStream<UIMessageChunk> | null>,
    isScopeCurrent: () => boolean,
  ): Promise<void> {
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
        const stream = await open(controller.signal);
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
        failed = !(
          (error instanceof Error && error.name === "AbortError") ||
          (controller.signal.aborted &&
            controller.signal.reason instanceof DOMException &&
            controller.signal.reason.name === "AbortError")
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
  }
}
