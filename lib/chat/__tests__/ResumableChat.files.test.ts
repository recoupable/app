// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import type { ChatTransport, UIMessage } from "ai";
import { ResumableChat } from "../ResumableChat";
// A synthetic FileList boundary with real browser File/FileReader conversion.
class SyntheticFileList {
  constructor(private readonly entries: File[]) {}
  [Symbol.iterator]() {
    return this.entries[Symbol.iterator]();
  }
}
afterEach(() => vi.unstubAllGlobals());
it("uses public SDK file conversion and retains metadata/text", async () => {
  vi.stubGlobal("FileList", SyntheticFileList);
  const sendMessages = vi.fn<ChatTransport<UIMessage>["sendMessages"]>(
    async () =>
      new ReadableStream({
        start(c) {
          c.close();
        },
      }),
  );
  const chat = new ResumableChat({
    generateId: () => "user",
    transport: { sendMessages, reconnectToStream: vi.fn() },
  });
  await chat.sendMessage({
    files: new SyntheticFileList([
      new File(["hello"], "hello.txt", { type: "text/plain" }),
    ]) as unknown as FileList,
    text: "Read this",
    metadata: { source: "test" },
  });
  expect(sendMessages).toHaveBeenCalledTimes(1);
  expect(chat.messages[0]).toEqual({
    id: "user",
    role: "user",
    metadata: { source: "test" },
    parts: [
      {
        type: "file",
        mediaType: "text/plain",
        filename: "hello.txt",
        url: "data:text/plain;base64,aGVsbG8=",
      },
      { type: "text", text: "Read this" },
    ],
  });
});
it.each(["stop", "scope"])(
  "does not submit pending file conversion after %s",
  async (mode) => {
    vi.stubGlobal("FileList", SyntheticFileList);
    let finish: (() => void) | undefined;
    vi.stubGlobal(
      "FileReader",
      class {
        onload?: (e: unknown) => void;
        readAsDataURL() {
          finish = () =>
            this.onload?.({
              target: { result: "data:text/plain;base64,aGVsbG8=" },
            });
        }
      },
    );
    let current = true;
    const sendMessages = vi.fn();
    const chat = new ResumableChat({
      captureResumeScope: () => () => current,
      transport: { sendMessages, reconnectToStream: vi.fn() },
    });
    const pending = chat.sendMessage({
      files: new SyntheticFileList([
        new File(["hello"], "hello.txt"),
      ]) as unknown as FileList,
    });
    await vi.waitFor(() => expect(finish).toBeDefined());
    if (mode === "stop") await chat.stop();
    else current = false;
    finish!();
    await pending;
    expect(sendMessages).not.toHaveBeenCalled();
    expect(chat.messages).toEqual([]);
  },
);
