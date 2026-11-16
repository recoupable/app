// @vitest-environment jsdom
import React from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { MessageParts } from "../MessageParts";
import { VercelChatContext } from "@/providers/VercelChatProvider";
import { createSnapshotConsumer } from "@/lib/intelligent-ui/chat/createSnapshotConsumer";
import {
  chatSnapshotPart,
  hostScope,
} from "@/lib/intelligent-ui/transport/__tests__/chatSnapshotFixture";

const moduleLoad = vi.hoisted(() => {
  let reject!: (reason: Error) => void;
  const promise = new Promise<never>((_, rejectPromise) => {
    reject = rejectPromise;
  });
  return { reject, promise, attempts: 0 };
});
const clipboardDescriptor = Object.getOwnPropertyDescriptor(
  navigator,
  "clipboard",
);
vi.mock("@/components/IntelligentUI/ChatSnapshot", async () => {
  moduleLoad.attempts++;
  return moduleLoad.promise;
});
vi.mock("@/providers/VercelChatProvider", async () => {
  const { createContext } = await import("react");
  return { VercelChatContext: createContext(undefined) };
});
vi.mock("../ViewingMessage", () => ({
  default: ({ partText }: { partText: string }) => <p>{partText}</p>,
}));
vi.mock("../EditingMessage", () => ({ default: () => null }));
vi.mock("../ToolComponents", () => ({
  getToolCallComponent: () => null,
  getToolResultComponent: () => null,
}));
vi.mock("../message-file-viewer", () => ({ default: () => null }));
vi.mock("@/components/reasoning/EnhancedReasoning", () => ({
  EnhancedReasoning: () => null,
}));

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  if (clipboardDescriptor)
    Object.defineProperty(navigator, "clipboard", clipboardDescriptor);
  else Reflect.deleteProperty(navigator, "clipboard");
});

it("does not load the visual module when gated off; pending and failed loading retain safe text beside ordinary prose", async () => {
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("VERCEL_ENV", "development");
  vi.stubEnv("NEXT_PUBLIC_VERCEL_ENV", "development");
  vi.stubEnv("NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT", "true");
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
  const consumer = createSnapshotConsumer(() => hostScope);
  const binding = { consumer, scopeKey: consumer.syncScope().key! };
  const part = chatSnapshotPart(1, "The accepted deterministic answer.");
  consumer.beginStream({ messageId: "assistant-1" })(part);
  const message = {
    id: "assistant-1",
    role: "assistant" as const,
    parts: [{ type: "text" as const, text: "Ordinary prose remains." }, part],
  };
  const reload = vi.fn();
  const view = () => (
    <VercelChatContext.Provider
      value={
        {
          messages: [message],
          status: "ready",
          reload,
          intelligentUI: binding,
        } as unknown as React.ContextType<typeof VercelChatContext>
      }
    >
      <MessageParts message={message} mode="view" setMode={() => {}} />
    </VercelChatContext.Provider>
  );
  vi.stubEnv("NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT", "false");
  const { rerender } = render(view());
  expect(moduleLoad.attempts).toBe(0);
  expect(screen.queryByText("The accepted deterministic answer.")).toBeNull();
  vi.stubEnv("NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT", "true");
  rerender(view());
  expect(screen.getByText("The accepted deterministic answer.")).toBeTruthy();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Copy response" }));
  });
  await vi.waitFor(() =>
    expect(writeText).toHaveBeenLastCalledWith(
      "Ordinary prose remains.\n\nThe accepted deterministic answer.",
    ),
  );
  message.parts = [part];
  rerender(view());
  fireEvent.click(screen.getByRole("button", { name: "Retry" }));
  expect(reload).toHaveBeenCalledTimes(1);
  message.parts = [{ type: "text", text: "Ordinary prose remains." }, part];
  rerender(view());
  await vi.waitFor(() => expect(moduleLoad.attempts).toBe(1));
  vi.spyOn(console, "error").mockImplementation(() => {});
  await act(async () => {
    moduleLoad.reject(new Error("Synthetic module fetch failure"));
  });
  expect(screen.getByText("The accepted deterministic answer.")).toBeTruthy();
  expect(screen.getByText("Ordinary prose remains.")).toBeTruthy();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Copy response" }));
  });
  await vi.waitFor(() => expect(writeText).toHaveBeenCalledTimes(2));
  expect(writeText).toHaveBeenLastCalledWith(
    "Ordinary prose remains.\n\nThe accepted deterministic answer.",
  );
  message.parts = [part];
  rerender(view());
  fireEvent.click(screen.getByRole("button", { name: "Retry" }));
  expect(reload).toHaveBeenCalledTimes(2);
});
