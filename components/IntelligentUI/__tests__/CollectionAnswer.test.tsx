// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import AnswerRenderer from "../AnswerRenderer";
import { surfaceSchema, type Surface } from "@/lib/intelligent-ui/schema";
import { surfaceWithCollection } from "@/lib/intelligent-ui/presentation/__tests__/surfaceWithCollection";
import { getAnswerText } from "@/lib/intelligent-ui/presentation/getAnswerText";
import { selectPresentation } from "@/lib/intelligent-ui/presentation/selectPresentation";
import { createSnapshotConsumer } from "@/lib/intelligent-ui/chat/createSnapshotConsumer";
const fixture = (): Surface =>
  surfaceSchema.parse({
    ...surfaceWithCollection({
      rows: Array.from({ length: 30 }, (_, i) => ({
        id: `row-${i}`,
        label: `Recording ${i}`,
        values:
          i === 2
            ? ({} as Record<string, string>)
            : {
                cost:
                  i === 0 ? "0 streams" : i === 1 ? "Unknown" : `${i} streams`,
              },
        evidenceIds: [],
      })),
      complete: false,
      totalCount: undefined,
    }),
    answer: {
      revision: 0,
      parts: [
        {
          type: "representation",
          id: "table",
          componentId: "options",
          benefit: "select-records",
        },
      ],
    },
  });
const show = (surface = fixture(), stateScope = "scope-a") => (
  <AnswerRenderer
    surface={surface}
    stateScope={stateScope}
    onInspectEvidence={() => {}}
  />
);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it("registers collections only for their declared benefit and capable host", () => {
  const s = fixture();
  expect(
    selectPresentation(
      s,
      {
        kind: "representation",
        componentId: "options",
        benefit: "select-records",
      },
      { distribution: true, timeline: true, collection: true },
    ).mode,
  ).toBe("visual");
  expect(
    selectPresentation(
      s,
      {
        kind: "representation",
        componentId: "options",
        benefit: "select-records",
      },
      { distribution: true, timeline: true },
    ).reason,
  ).toBe("unsupported-host");
  s.answer!.parts[0] = {
    type: "representation",
    id: "table",
    componentId: "options",
    benefit: "show-distribution",
  };
  expect(surfaceSchema.safeParse(s).success).toBe(false);
});
it("renders bounded rows, retains local selection across pages and exports exact values", () => {
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  render(show());
  expect(screen.getAllByRole("row")).toHaveLength(26);
  expect(screen.getByText("0 streams")).toBeTruthy();
  expect(screen.getByText("Unknown")).toBeTruthy();
  expect(screen.getByText("Not supplied")).toBeTruthy();
  fireEvent.click(screen.getByRole("checkbox", { name: "Select Recording 0" }));
  fireEvent.click(screen.getByRole("button", { name: "Next page" }));
  expect(screen.getAllByRole("row")).toHaveLength(6);
  expect(screen.getByRole("status").textContent).toContain(
    "1 selected locally",
  );
  const copy = screen.getByRole("textbox", {
    name: "Collection text and local selection",
  }) as HTMLTextAreaElement;
  expect(copy.value).toContain(getAnswerText(fixture()));
  expect(copy.value).toContain('"row-0"');
  expect(copy.value).toContain("0 streams");
  fireEvent.click(screen.getByRole("button", { name: "Previous page" }));
  expect(
    (
      screen.getByRole("checkbox", {
        name: "Select Recording 0",
      }) as HTMLInputElement
    ).checked,
  ).toBe(true);
  expect(fetch).not.toHaveBeenCalled();
});
it("caps selections at eight and clears without changing source data", () => {
  const s = fixture(),
    before = JSON.stringify(s);
  render(show(s));
  screen
    .getAllByRole("checkbox")
    .slice(0, 8)
    .forEach((el) => fireEvent.click(el));
  expect(
    (screen.getAllByRole("checkbox")[8] as HTMLInputElement).disabled,
  ).toBe(true);
  expect(
    (screen.getAllByRole("checkbox")[0] as HTMLInputElement).disabled,
  ).toBe(false);
  fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
  expect(screen.getByRole("status").textContent).toContain(
    "0 selected locally",
  );
  expect(JSON.stringify(s)).toBe(before);
});
it("preserves identical content but resets on source or host scope changes", () => {
  const s = fixture();
  const { rerender } = render(show(s));
  fireEvent.click(screen.getAllByRole("checkbox")[0]);
  rerender(show(structuredClone(s)));
  expect((screen.getAllByRole("checkbox")[0] as HTMLInputElement).checked).toBe(
    true,
  );
  const changed = structuredClone(s);
  changed.components[0].title = "Corrected source";
  rerender(show(changed));
  expect((screen.getAllByRole("checkbox")[0] as HTMLInputElement).checked).toBe(
    false,
  );
  fireEvent.click(screen.getAllByRole("checkbox")[0]);
  rerender(show(changed, "scope-b"));
  expect((screen.getAllByRole("checkbox")[0] as HTMLInputElement).checked).toBe(
    false,
  );
});
it("uses identical static text without selection on unsupported hosts", () => {
  const s = fixture();
  render(
    <AnswerRenderer
      surface={s}
      capabilities={{ distribution: false, timeline: false, collection: false }}
      onInspectEvidence={() => {}}
    />,
  );
  expect(screen.queryByRole("checkbox")).toBeNull();
  expect(
    screen.getByText(
      (_, el) => el?.tagName === "P" && el.textContent === getAnswerText(s),
    ),
  ).toBeTruthy();
});
it("shows an empty collection without inventing zeros or controls", () => {
  const s = fixture();
  if (s.components[0].type !== "collection") throw Error();
  s.components[0].rows = [];
  render(show(s));
  expect(screen.queryByRole("checkbox")).toBeNull();
  expect(
    screen.getByText("No supplied records. This does not mean zero activity."),
  ).toBeTruthy();
});
it("keeps the full snapshot byte limit when collection support is added", () => {
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT", "true");
  const scope = {
    actorId: "actor",
    accountId: "account",
    workspaceId: "workspace",
    sessionId: "session",
    chatId: "chat",
    subject: { kind: "review", id: "example" },
  };
  const consumer = createSnapshotConsumer(() => scope);
  const s = fixture();
  const stream = consumer.beginStream();
  stream({ type: "start", messageId: "message" });
  expect(
    stream({ type: "data-intelligent-ui-snapshot", id: s.id, data: s }),
  ).toBeTruthy();
  const large = structuredClone(s);
  large.revision = 1;
  large.answer!.revision = 1;
  if (large.components[0].type !== "collection") throw Error();
  large.components[0].rows = Array.from({ length: 200 }, (_, i) => ({
    id: `large-${i}`,
    label: `Large ${i}`,
    values: { cost: "é".repeat(2000) },
    evidenceIds: [],
  }));
  expect(surfaceSchema.safeParse(large).success).toBe(true);
  expect(
    stream({ type: "data-intelligent-ui-snapshot", id: large.id, data: large }),
  ).toBeUndefined();
  vi.unstubAllEnvs();
});
