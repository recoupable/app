// @vitest-environment jsdom
import React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import type { UIMessage } from "ai";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { MessageParts } from "../MessageParts";
import { VercelChatContext } from "@/providers/VercelChatProvider";
import { createSnapshotConsumer } from "@/lib/intelligent-ui/chat/createSnapshotConsumer";
import {
  chatSnapshotPart,
  hostScope,
} from "@/lib/intelligent-ui/transport/__tests__/chatSnapshotFixture";
import { getCompletedExample } from "@/lib/intelligent-ui/playground/getCompletedExample";
import { songScenario } from "@/lib/intelligent-ui/playground/songScenario";

// Keep the owning MessageParts and Intelligent UI renderers real; adapters avoid
// booting authentication or unrelated product routes in this synthetic seam.
vi.mock("@/providers/VercelChatProvider", async () => {
  const { createContext } = await import("react");
  return { VercelChatContext: createContext(undefined) };
});
vi.mock("../ViewingMessage", () => ({
  default: ({ partText }: { partText: string }) => <p>{partText}</p>,
}));
vi.mock("../EditingMessage", () => ({ default: () => <p>Message editor</p> }));
vi.mock("../ToolComponents", () => ({
  getToolCallComponent: () => <p key="tool">Synthetic tool call</p>,
  getToolResultComponent: () => <p key="tool">Synthetic tool result</p>,
}));
vi.mock("../message-file-viewer", () => ({
  default: () => <p>Synthetic file</p>,
}));
vi.mock("@/components/reasoning/EnhancedReasoning", () => ({
  EnhancedReasoning: ({ content }: { content: string }) => <p>{content}</p>,
}));
vi.mock("@/components/IntelligentUI/AnswerRenderer", async (importOriginal) => {
  const original =
    await importOriginal<
      typeof import("@/components/IntelligentUI/AnswerRenderer")
    >();
  return {
    default: (props: React.ComponentProps<typeof original.default>) => {
      if (props.surface.title === "Synthetic renderer failure")
        throw new Error("Synthetic renderer failure");
      return <original.default {...props} />;
    },
  };
});

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("VERCEL_ENV", "development");
  vi.stubEnv("NEXT_PUBLIC_VERCEL_ENV", "development");
  vi.stubEnv("NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT", "true");
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function timelinePart(revision: number) {
  const data = getCompletedExample(songScenario);
  data.context = {
    workspaceId: hostScope.workspaceId,
    subject: { ...hostScope.subject, label: "Synthetic artist" },
  };
  data.revision = data.answer!.revision = revision;
  return { type: "data-intelligent-ui-snapshot" as const, id: data.id, data };
}

function fixture(part = chatSnapshotPart(1)) {
  let scope = structuredClone(hostScope);
  const consumer = createSnapshotConsumer(() => scope);
  const scopeKey = consumer.syncScope().key!;
  const accepted = consumer.beginStream({ messageId: "assistant-1" })(part)!;
  const message: UIMessage = {
    id: "assistant-1",
    role: "assistant",
    metadata: {
      routing: {
        status: "selected",
        source: "fallback",
        modelId: "openai/gpt-6-astra",
        tier: "frontier",
        reason: "Synthetic routing",
      },
    },
    parts: [
      { type: "text", text: "Ordinary text before." },
      accepted as UIMessage["parts"][number],
      { type: "text", text: "Ordinary text after." },
    ],
  };
  const reload = vi.fn();
  const binding = { consumer, scopeKey };
  const view = (current = message, mode: "view" | "edit" = "view") => (
    <VercelChatContext.Provider
      value={
        {
          messages: [current],
          status: "ready",
          reload,
          intelligentUI: binding,
        } as unknown as React.ContextType<typeof VercelChatContext>
      }
    >
      <MessageParts message={current} mode={mode} setMode={() => {}} />
    </VercelChatContext.Provider>
  );
  return {
    consumer,
    binding,
    message,
    reload,
    view,
    setScope: (next: typeof hostScope) => {
      scope = structuredClone(next);
      binding.scopeKey = consumer.syncScope().key!;
    },
    changeScope: () => {
      scope = { ...scope, subject: { ...scope.subject, id: "another-artist" } };
      consumer.syncScope();
    },
  };
}

it("renders an accepted snapshot inline beside ordinary text and preserves retry/copy/routing", async () => {
  const { view, reload } = fixture(
    chatSnapshotPart(1, "A useful inline explanation."),
  );
  render(view());
  await screen.findByRole("article", { name: "Recoup response" });
  expect(screen.getByText("Ordinary text before.")).toBeTruthy();
  expect(screen.getByText("Ordinary text after.")).toBeTruthy();
  expect(screen.getByText("A useful inline explanation.")).toBeTruthy();
  expect(screen.getAllByRole("button", { name: "Copy response" })).toHaveLength(
    1,
  );
  expect(screen.getByText("Astra")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Retry" }));
  expect(reload).toHaveBeenCalledTimes(1);
});

it("preserves exactly one Retry on completed text followed by an accepted snapshot", async () => {
  const { view, message, reload } = fixture(
    chatSnapshotPart(1, "Accepted trailing response"),
  );
  const text = { type: "text" as const, text: "Completed ordinary answer" };
  const { rerender } = render(view({ ...message, parts: [text] }));
  expect(screen.getAllByRole("button", { name: "Retry" })).toHaveLength(1);
  rerender(view({ ...message, parts: [text, message.parts[1]] }));
  await screen.findByText("Accepted trailing response");
  expect(screen.getAllByRole("button", { name: "Retry" })).toHaveLength(1);
  fireEvent.click(screen.getByRole("button", { name: "Retry" }));
  expect(reload).toHaveBeenCalledTimes(1);
});

it("preserves Retry for accepted trailing UI when its renderer falls back to text", async () => {
  const part = chatSnapshotPart(1, "Fallback remains retryable");
  part.data.title = "Synthetic renderer failure";
  vi.spyOn(console, "error").mockImplementation(() => {});
  const { view, message, reload } = fixture(part);
  render(view({ ...message, parts: message.parts.slice(0, 2) }));
  await screen.findByText("Fallback remains retryable");
  fireEvent.click(screen.getByRole("button", { name: "Retry" }));
  expect(reload).toHaveBeenCalledOnce();
});

it("does not render unaccepted or unsupported data, and keeps reasoning/files/tools/text routes", () => {
  const { view, message } = fixture();
  const unaccepted: UIMessage = {
    ...message,
    id: "unaccepted",
    parts: [
      { type: "reasoning", text: "Synthetic reasoning", state: "done" },
      {
        type: "file",
        mediaType: "image/png",
        url: "https://media.invalid/file.png",
      },
      {
        type: "tool-synthetic",
        toolCallId: "call",
        input: {},
        state: "output-available",
        output: {},
      },
      chatSnapshotPart(1, "Must not render"),
      { type: "data-other", data: { text: "Unknown data" } },
      { type: "text", text: "Ordinary text remains." },
    ],
  };
  render(view(unaccepted));
  for (const text of [
    "Synthetic reasoning",
    "Synthetic file",
    "Synthetic tool result",
    "Ordinary text remains.",
  ])
    expect(screen.getByText(text)).toBeTruthy();
  expect(screen.queryByText("Must not render")).toBeNull();
  expect(screen.queryByText("Unknown data")).toBeNull();
});

it.each([false, true])(
  "production build with opt-in=%s always preserves only the ordinary chat path",
  (enabled) => {
    const { view } = fixture(chatSnapshotPart(1, "Experimental content"));
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT", String(enabled));
    render(view());
    expect(screen.queryByText("Experimental content")).toBeNull();
    expect(screen.getByText("Ordinary text before.")).toBeTruthy();
    expect(screen.getByText("Ordinary text after.")).toBeTruthy();
  },
);

it("keeps selected section, control DOM/focus and position across interruption, compatible revision and unrelated appended text", () => {
  const part = timelinePart(1);
  const { view, consumer, message, binding } = fixture(part);
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  const { rerender } = render(view());
  const chorus = screen.getByRole("button", { name: "Chorus, 0:28 to 0:40" });
  chorus.focus();
  fireEvent.click(chorus);
  expect(chorus.getAttribute("aria-current")).toBe("true");
  consumer.cancel();
  rerender(
    view({
      ...message,
      parts: [
        ...message.parts,
        { type: "text", text: "Stream interrupted. Existing answer remains." },
      ],
    }),
  );
  expect(document.activeElement).toBe(chorus);
  const update = timelinePart(2);
  update.data.answer!.parts.push({
    type: "markdown",
    id: "extra-context",
    text: "New explanatory context.",
  });
  update.data.evidence[0].text += " More source context.";
  const accepted = consumer.beginStream({ messageId: message.id })(update)!;
  const updated = {
    ...message,
    parts: message.parts.map((item) =>
      item.type === update.type
        ? (accepted as UIMessage["parts"][number])
        : item,
    ),
  };
  consumer.observeMessages([updated], binding.scopeKey);
  rerender(view(updated));
  expect(screen.getByRole("button", { name: "Chorus, 0:28 to 0:40" })).toBe(
    chorus,
  );
  expect(chorus.getAttribute("aria-current")).toBe("true");
  expect(document.activeElement).toBe(chorus);
  expect(screen.getByText("New explanatory context.")).toBeTruthy();
  const buttons = screen.getAllByRole("button", { name: /, 0:/ });
  for (let index = 0; index < 100; index++)
    fireEvent.click(buttons[index % buttons.length]);
  expect(fetch).not.toHaveBeenCalled();
});

it("resets local controls for changed interval meaning and hides old UI when host scope changes", () => {
  const { view, consumer, message, changeScope } = fixture(timelinePart(1));
  const { rerender } = render(view());
  const chorus = screen.getByRole("button", { name: "Chorus, 0:28 to 0:40" });
  fireEvent.click(chorus);
  const update = timelinePart(2);
  const timeline = update.data.components[0];
  if (timeline.type !== "timeline") throw new Error("Expected timeline");
  timeline.sections[3].label = "New section meaning";
  consumer.beginStream({ messageId: message.id })(update);
  rerender(view());
  expect(
    screen
      .getByRole("button", { name: "Intro, 0:00 to 0:08" })
      .getAttribute("aria-current"),
  ).toBe("true");
  expect(chorus.isConnected).toBe(false);
  changeScope();
  rerender(view());
  expect(screen.queryByRole("group", { name: "Explore sections" })).toBeNull();
  expect(screen.getByText("Ordinary text before.")).toBeTruthy();
});

it("isolates timeline selection between assistant messages reusing the same Surface/component IDs", () => {
  const { consumer, binding, message } = fixture(timelinePart(1));
  const view = (messages: UIMessage[]) => (
    <VercelChatContext.Provider
      value={
        {
          messages,
          status: "ready",
          intelligentUI: binding,
        } as unknown as React.ContextType<typeof VercelChatContext>
      }
    >
      {messages.map((item) => (
        <MessageParts
          key={item.id}
          message={item}
          mode="view"
          setMode={() => {}}
        />
      ))}
    </VercelChatContext.Provider>
  );
  const { rerender } = render(view([message]));
  const firstChorus = screen.getByRole("button", {
    name: "Chorus, 0:28 to 0:40",
  });
  fireEvent.click(firstChorus);
  expect(firstChorus.getAttribute("aria-current")).toBe("true");
  const part = timelinePart(1);
  const next = consumer.beginStream({ messageId: "assistant-2" })(part)!;
  const second: UIMessage = {
    id: "assistant-2",
    role: "assistant",
    parts: [next as UIMessage["parts"][number]],
  };
  rerender(view([message, second]));
  const groups = screen.getAllByRole("group", { name: "Explore sections" });
  expect(groups).toHaveLength(2);
  expect(
    within(groups[0]).getByRole("button", { name: "Chorus, 0:28 to 0:40" }),
  ).toBe(firstChorus);
  expect(firstChorus.getAttribute("aria-current")).toBe("true");
  expect(
    within(groups[1])
      .getByRole("button", { name: "Intro, 0:00 to 0:08" })
      .getAttribute("aria-current"),
  ).toBe("true");
  expect(
    within(groups[1])
      .getByRole("button", { name: "Chorus, 0:28 to 0:40" })
      .getAttribute("aria-current"),
  ).toBeNull();
});

it("keeps evidence inspection local and returns focus to the source control", async () => {
  const { view } = fixture(timelinePart(1));
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  render(view());
  const source = screen.getByRole("button", {
    name: "Original audio & section notes",
  });
  fireEvent.click(source);
  expect(screen.getByRole("dialog", { name: "Source details" })).toBeTruthy();
  fireEvent.click(
    screen.getByRole("button", { name: "Close evidence inspector" }),
  );
  await vi.waitFor(() => expect(document.activeElement).toBe(source));
  expect(fetch).not.toHaveBeenCalled();
});

it("uses validated deterministic text on renderer failure, preserving ordinary prose and recovering on a later revision", () => {
  const part = chatSnapshotPart(1, "Safe deterministic answer.");
  part.data.title = "Synthetic renderer failure";
  vi.spyOn(console, "error").mockImplementation(() => {});
  const { view, consumer, message } = fixture(part);
  const { rerender } = render(view());
  expect(screen.getByText("Safe deterministic answer.").tagName).toBe("P");
  expect(screen.getByText("Ordinary text after.")).toBeTruthy();
  consumer.beginStream({ messageId: message.id })(
    chatSnapshotPart(2, "Recovered accepted answer."),
  );
  rerender(view());
  expect(screen.getByText("Recovered accepted answer.")).toBeTruthy();
});

it("uses fallback text for a valid Surface without a supported composed answer", () => {
  const part = chatSnapshotPart(1, "Plain response from a valid snapshot.");
  delete part.data.answer;
  part.data.components = [
    {
      type: "summary",
      id: "summary",
      title: "Summary",
      text: "Metadata is not a second app card.",
      evidenceIds: [],
    },
  ];
  const { view } = fixture(part);
  render(view());
  expect(
    screen.getByText("Plain response from a valid snapshot."),
  ).toBeTruthy();
  expect(screen.queryByRole("heading", { name: "Summary" })).toBeNull();
});

it("renders safe text for a snapshot-only history answer evicted from the bounded visual ledger", () => {
  const { consumer, binding, view } = fixture();
  const history: UIMessage[] = Array.from({ length: 20 }, (_, index) => ({
    id: `history-${index}`,
    role: "assistant",
    parts: [chatSnapshotPart(index + 1, `Saved answer ${index + 1}`)],
  }));
  const loaded = consumer.hydrate(history, binding.scopeKey);
  render(view(loaded[0]));
  expect(screen.getByText("Saved answer 1")).toBeTruthy();
  expect(screen.queryByRole("article", { name: "Recoup response" })).toBeNull();
});

it("restores the same message selection after leaving and reauthorizing its host scope", async () => {
  const { view, consumer, message, binding, setScope } = fixture(
    timelinePart(1),
  );
  const { rerender } = render(view());
  await screen.findByRole("button", { name: "Chorus, 0:28 to 0:40" });
  fireEvent.click(screen.getByRole("button", { name: "Chorus, 0:28 to 0:40" }));
  const originalBinding = binding.scopeKey;
  const late = consumer.beginStream({ messageId: message.id });
  setScope({ ...hostScope, accountId: "another-account" });
  rerender(view());
  expect(screen.queryByRole("group", { name: "Explore sections" })).toBeNull();
  setScope(hostScope);
  expect(binding.scopeKey).not.toBe(originalBinding);
  expect(late(timelinePart(2))).toBeUndefined();
  expect(
    consumer.getSnapshot(message.id, timelinePart(1).id, originalBinding),
  ).toBeUndefined();
  // Local cache alone cannot restore protected content. A fresh authorized
  // history response is still required before the renderer can use the position.
  rerender(view());
  expect(screen.queryByRole("group", { name: "Explore sections" })).toBeNull();
  const [restored] = consumer.hydrate(
    [structuredClone(message)],
    binding.scopeKey,
  );
  rerender(view(restored));
  expect(
    (
      await screen.findByRole("button", { name: "Chorus, 0:28 to 0:40" })
    ).getAttribute("aria-current"),
  ).toBe("true");
});

it.each([
  ["actor", { actorId: "other-actor" }],
  ["account", { accountId: "other-account" }],
  ["workspace namespace", { workspaceKind: "other-kind" }],
  ["reporting query", { queryKey: "other-query" }],
  ["session", { sessionId: "other-session" }],
  ["chat", { chatId: "other-chat" }],
])(
  "does not restore selection in a different %s after accepting its content",
  async (_label, change) => {
    const { view, consumer, message, binding, setScope } = fixture(
      timelinePart(1),
    );
    const { rerender } = render(view());
    fireEvent.click(
      await screen.findByRole("button", { name: "Chorus, 0:28 to 0:40" }),
    );
    setScope({ ...hostScope, ...change });
    const [fresh] = consumer.hydrate(
      [structuredClone(message)],
      binding.scopeKey,
    );
    rerender(view(fresh));
    expect(
      (
        await screen.findByRole("button", { name: "Intro, 0:00 to 0:08" })
      ).getAttribute("aria-current"),
    ).toBe("true");
  },
);

it("restores after a new consumer loads authorized history regardless of its prior scope count", async () => {
  const original = fixture(timelinePart(1));
  original.setScope({ ...hostScope, accountId: "other-account" });
  original.setScope(hostScope);
  const [message] = original.consumer.hydrate(
    [original.message],
    original.binding.scopeKey,
  );
  const mounted = render(original.view(message));
  fireEvent.click(
    await screen.findByRole("button", { name: "Chorus, 0:28 to 0:40" }),
  );
  mounted.unmount();
  original.consumer.dispose();
  const reopened = fixture(timelinePart(1));
  expect(reopened.binding.scopeKey).not.toBe(original.binding.scopeKey);
  render(reopened.view());
  expect(
    (
      await screen.findByRole("button", { name: "Chorus, 0:28 to 0:40" })
    ).getAttribute("aria-current"),
  ).toBe("true");
});
