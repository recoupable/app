// @vitest-environment jsdom
import React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
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

// The owning renderer, CopyButton, useCopy and snapshot validation are real.
// Authentication and unrelated tool adapters are outside this synthetic seam.
vi.mock("@/providers/VercelChatProvider", async () => {
  const { createContext } = await import("react");
  return { VercelChatContext: createContext(undefined) };
});
vi.mock("../ToolComponents", () => ({
  getToolCallComponent: () => null,
  getToolResultComponent: () => null,
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

const writeText = vi.fn().mockResolvedValue(undefined);
const clipboardDescriptor = Object.getOwnPropertyDescriptor(
  navigator,
  "clipboard",
);
beforeEach(() => {
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("VERCEL_ENV", "development");
  vi.stubEnv("NEXT_PUBLIC_VERCEL_ENV", "development");
  vi.stubEnv("NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT", "true");
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
  writeText.mockClear();
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  if (clipboardDescriptor)
    Object.defineProperty(navigator, "clipboard", clipboardDescriptor);
  else Reflect.deleteProperty(navigator, "clipboard");
});

function fixture(part = chatSnapshotPart(1, "The accepted visual answer.")) {
  let scope = structuredClone(hostScope);
  const consumer = createSnapshotConsumer(() => scope);
  const binding = { consumer, scopeKey: consumer.syncScope().key! };
  const accepted = consumer.beginStream({ messageId: "assistant-1" })(
    part,
  )! as UIMessage["parts"][number];
  const message: UIMessage = {
    id: "assistant-1",
    role: "assistant",
    parts: [
      { type: "text", text: "Ordinary prose before." },
      accepted,
      { type: "text", text: "Ordinary prose after." },
    ],
  };
  const view = (current = message) => (
    <VercelChatContext.Provider
      value={
        {
          messages: [current],
          status: "ready",
          intelligentUI: binding,
        } as unknown as React.ContextType<typeof VercelChatContext>
      }
    >
      <MessageParts message={current} mode="view" setMode={() => {}} />
    </VercelChatContext.Provider>
  );
  return {
    consumer,
    binding,
    message,
    accepted,
    view,
    changeScope: () => {
      scope = { ...scope, subject: { ...scope.subject, id: "another-artist" } };
      consumer.syncScope();
    },
  };
}

async function copyResponse(expected: string) {
  const previousCalls = writeText.mock.calls.length;
  fireEvent.click(screen.getByRole("button", { name: "Copy response" }));
  await waitFor(() => {
    expect(writeText).toHaveBeenCalledTimes(previousCalls + 1);
    expect(writeText).toHaveBeenLastCalledWith(expected);
  });
}

function distributionPart(revision: number, alpha: number, beta: number) {
  const part = chatSnapshotPart(revision);
  part.data.components = [
    {
      type: "distribution",
      id: "plays",
      title: "Supplied plays",
      measure: {
        label: "Track plays",
        unit: "plays",
        periodStart: "2026-09-01",
        periodEnd: "2026-09-30",
        population: "Two supplied tracks",
      },
      complete: true,
      totalCount: 2,
      items: [
        { id: "alpha", label: "Alpha", value: alpha, evidenceIds: ["counts"] },
        { id: "beta", label: "Beta", value: beta, evidenceIds: ["counts"] },
      ],
    },
  ];
  part.data.evidence = [
    {
      id: "counts",
      label: "September counts",
      sourceLabel: "Synthetic supplied data",
      observedAt: "2026-10-16T12:00:00Z",
      kind: "submitted",
      status: "current",
      text: "Synthetic integer play counts for two supplied tracks.",
      href: "https://evidence.invalid/counts",
    },
  ];
  part.data.answer!.parts = [
    {
      type: "insight",
      id: "insight",
      componentId: "plays",
      calculation: "top-share",
      count: 1,
    },
    {
      type: "representation",
      id: "chart",
      componentId: "plays",
      benefit: "show-distribution",
    },
    { type: "sources", id: "source", evidenceIds: ["counts"] },
  ];
  return part;
}

it("copies one complete accepted response in prose and visual order", async () => {
  const { view } = fixture();
  render(view());
  await screen.findByText("The accepted visual answer.");
  const buttons = screen.getAllByRole("button", { name: "Copy response" });
  fireEvent.click(buttons.at(-1)!);
  await waitFor(() =>
    expect(writeText).toHaveBeenCalledWith(
      "Ordinary prose before.\n\nThe accepted visual answer.\n\nOrdinary prose after.",
    ),
  );
  expect(buttons).toHaveLength(1);
});

it("provides a working copy action for an accepted snapshot-only response", async () => {
  const { message, accepted, view } = fixture();
  render(view({ ...message, parts: [accepted] }));
  await screen.findByText("The accepted visual answer.");
  fireEvent.click(screen.getByRole("button", { name: "Copy response" }));
  await waitFor(() =>
    expect(writeText).toHaveBeenCalledWith("The accepted visual answer."),
  );
});

it("copies accepted computed values and citations after an update, ignoring rejected raw replays", async () => {
  const { consumer, message, view } = fixture(distributionPart(1, 60, 40));
  const { rerender } = render(view());
  await screen.findByText(
    "Alpha accounts for 60% of the plays in this selection.",
  );
  const revisionOne =
    "Ordinary prose before.\n\nAlpha accounts for 60% of the plays in this selection.\n\nSupplied plays\nTrack plays · 2026-09-01 to 2026-09-30\nTwo supplied tracks. Complete supplied selection.\nAlpha: 60 plays\nBeta: 40 plays\nTotal supplied: 100 plays.\n\nSeptember counts · Synthetic supplied data · 2026-10-16T12:00:00Z · current · https://evidence.invalid/counts\n\nOrdinary prose after.";
  await copyResponse(revisionOne);
  const filter = consumer.beginStream({ messageId: message.id });
  const update = distributionPart(2, 80, 20);
  expect(filter(update)).toBeTruthy();
  // Deliberately retain the original raw SDK part: the accepted ledger is the
  // display/copy authority even when the props lag a valid update.
  rerender(view());
  await screen.findByText(
    "Alpha accounts for 80% of the plays in this selection.",
  );
  const revisionTwo =
    "Ordinary prose before.\n\nAlpha accounts for 80% of the plays in this selection.\n\nSupplied plays\nTrack plays · 2026-09-01 to 2026-09-30\nTwo supplied tracks. Complete supplied selection.\nAlpha: 80 plays\nBeta: 20 plays\nTotal supplied: 100 plays.\n\nSeptember counts · Synthetic supplied data · 2026-10-16T12:00:00Z · current · https://evidence.invalid/counts\n\nOrdinary prose after.";
  await copyResponse(revisionTwo);
  const malformed = distributionPart(3, 999, 1);
  malformed.data.answer!.revision = 2;
  expect(filter(malformed)).toBeUndefined();
  expect(filter(distributionPart(1, 1, 999))).toBeUndefined();
  rerender(
    view({
      ...message,
      parts: [message.parts[0], malformed, message.parts[2]],
    }),
  );
  await copyResponse(revisionTwo);
  consumer.cancel();
  expect(filter(distributionPart(4, 1, 999))).toBeUndefined();
  rerender(view());
  await copyResponse(revisionTwo);
});

it("keeps copy available when the visual renderer falls back and recovers", async () => {
  const part = chatSnapshotPart(1, "Accepted fallback answer.");
  part.data.title = "Synthetic renderer failure";
  vi.spyOn(console, "error").mockImplementation(() => {});
  const { consumer, message, view } = fixture(part);
  const { rerender } = render(view({ ...message, parts: [message.parts[1]] }));
  await screen.findByText("Accepted fallback answer.");
  await copyResponse("Accepted fallback answer.");
  consumer.beginStream({ messageId: message.id })(
    chatSnapshotPart(2, "Recovered accepted answer."),
  );
  rerender(view({ ...message, parts: [message.parts[1]] }));
  await screen.findByText("Recovered accepted answer.");
  await copyResponse("Recovered accepted answer.");
});

it("copies validated evicted history text but cannot leak it after a committed scope change", async () => {
  const { consumer, binding, view, changeScope } = fixture();
  const loaded = consumer.hydrate(
    Array.from(
      { length: 20 },
      (_, index): UIMessage => ({
        id: `history-${index}`,
        role: "assistant",
        parts: [chatSnapshotPart(index + 1, `Saved answer ${index + 1}`)],
      }),
    ),
    binding.scopeKey,
  );
  const { rerender } = render(view(loaded[0]));
  expect(screen.getByText("Saved answer 1")).toBeTruthy();
  expect(screen.queryByRole("article", { name: "Recoup response" })).toBeNull();
  await copyResponse("Saved answer 1");
  changeScope();
  rerender(view(loaded[0]));
  expect(screen.queryByText("Saved answer 1")).toBeNull();
  expect(screen.queryByRole("button", { name: "Copy response" })).toBeNull();
});

it("reverts to ordinary prose copy after the active host scope changes", async () => {
  const { view, changeScope } = fixture();
  const { rerender } = render(view());
  await copyResponse(
    "Ordinary prose before.\n\nThe accepted visual answer.\n\nOrdinary prose after.",
  );
  changeScope();
  rerender(view());
  const buttons = screen.getAllByRole("button", { name: "Copy response" });
  expect(buttons).toHaveLength(2);
  fireEvent.click(buttons[1]);
  await waitFor(() =>
    expect(writeText).toHaveBeenLastCalledWith("Ordinary prose after."),
  );
  expect(screen.queryByText("The accepted visual answer.")).toBeNull();
});

it.each(["ordinary", "gate-off", "production", "user", "unaccepted"])(
  "preserves existing per-fragment copy for %s messages",
  async (scenario) => {
    const { message, view } = fixture();
    if (scenario === "gate-off")
      vi.stubEnv("NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT", "false");
    if (scenario === "production") vi.stubEnv("NODE_ENV", "production");
    const current = {
      ...message,
      ...(scenario === "user" ? { role: "user" as const } : {}),
      ...(scenario === "unaccepted" ? { id: "unaccepted" } : {}),
      ...(scenario === "ordinary"
        ? { parts: message.parts.filter((part) => part.type === "text") }
        : {}),
    };
    render(view(current));
    const buttons = screen.getAllByRole("button", { name: "Copy response" });
    expect(buttons).toHaveLength(2);
    fireEvent.click(buttons[0]);
    await waitFor(() =>
      expect(writeText).toHaveBeenLastCalledWith("Ordinary prose before."),
    );
    fireEvent.click(buttons[1]);
    await waitFor(() =>
      expect(writeText).toHaveBeenLastCalledWith("Ordinary prose after."),
    );
    expect(screen.queryByText("The accepted visual answer.")).toBeNull();
  },
);

it("copies all timeline alternatives without changing the selected section or focused control", async () => {
  const data = getCompletedExample(songScenario);
  const part = chatSnapshotPart(1);
  data.id = part.id;
  data.revision = data.answer!.revision = 1;
  data.context = part.data.context;
  part.data = data;
  const { consumer, message, view } = fixture(part);
  const { rerender } = render(view());
  const chorus = await screen.findByRole("button", {
    name: "Chorus, 0:28 to 0:40",
  });
  chorus.focus();
  fireEvent.click(chorus);
  const updated = structuredClone(part);
  updated.data.revision = updated.data.answer!.revision = 2;
  updated.data.answer!.parts.push({
    type: "markdown",
    id: "updated-note",
    text: "Updated accepted note.",
  });
  consumer.beginStream({ messageId: message.id })(updated);
  rerender(view());
  expect(document.activeElement).toBe(chorus);
  expect(chorus.getAttribute("aria-current")).toBe("true");
  fireEvent.click(screen.getByRole("button", { name: "Copy response" }));
  await waitFor(() =>
    expect(writeText).toHaveBeenLastCalledWith(
      expect.stringContaining("Updated accepted note."),
    ),
  );
  const copied = writeText.mock.lastCall![0];
  expect(copied).toContain("0:00–0:08 · Intro:");
  expect(copied).toContain("0:28–0:40 · Chorus:");
  expect(copied).toContain("Original audio & section notes");
  expect(chorus.getAttribute("aria-current")).toBe("true");
});
