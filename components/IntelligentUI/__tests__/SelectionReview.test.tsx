// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useState } from "react";
import SelectionReview from "../SelectionReview";
import SelectionContinuityLab from "../SelectionContinuityLab";
import { createSelectionFixtureHost } from "@/lib/intelligent-ui/playground/selection/createSelectionFixtureHost";
import type { ObjectRef } from "@/lib/intelligent-ui/descriptors/schemas";
import type { SubjectContextCurrent } from "@/lib/intelligent-ui/subject-context/projectSubjectContext";
const projection = () =>
  JSON.parse(
    (
      screen.getByRole("textbox", {
        name: "Exact local projection",
      }) as HTMLTextAreaElement
    ).value,
  );
const select = () =>
  fireEvent.click(screen.getByRole("checkbox", { name: "Recording 00005" }));
const expand = () =>
  fireEvent.click(
    screen.getByRole("button", { name: "Expand selection review" }),
  );
const close = () =>
  fireEvent.click(
    screen.getByRole("button", { name: "Close selection review" }),
  );
beforeEach(() => {
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT", "true");
  vi.stubEnv("VERCEL_ENV", "development");
});
afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
it("carries the same exact selection inline/expanded, invalidates edits, and never sends", () => {
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  render(<SelectionContinuityLab />);
  select();
  expand();
  const first = projection();
  expect(first.selection).toHaveLength(1);
  expect(first.selection[0].id).toBe("synthetic:recording:00005");
  close();
  expect(projection()).toEqual(first);
  expand();
  expect(projection()).toEqual(first);
  fireEvent.click(screen.getByRole("checkbox", { name: "Recording 00006" }));
  expect(
    screen.queryByRole("textbox", { name: "Exact local projection" }),
  ).toBeNull();
  expect(screen.getByRole("status").textContent).toContain(
    "Preview unavailable",
  );
  fireEvent.click(screen.getByRole("button", { name: "Refresh preview" }));
  expect(projection().selection).toHaveLength(2);
  fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
  expect(
    screen.queryByRole("textbox", { name: "Exact local projection" }),
  ).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Refresh preview" }));
  expect(projection().selection).toEqual([]);
  expect(fetch).not.toHaveBeenCalled();
});
it.each(["workspace", "revision", "source", "purpose", "subject"])(
  "invalidates captured preview on mounted %s transition",
  (kind) => {
    render(<SelectionContinuityLab />);
    select();
    expand();
    close();
    fireEvent.click(screen.getByText("Synthetic context controls"));
    fireEvent.click(screen.getByRole("button", { name: `Change ${kind}` }));
    expand();
    expect(
      screen.queryByRole("textbox", { name: "Exact local projection" }),
    ).toBeNull();
    expect(screen.getByRole("status").textContent).toContain(
      "Preview unavailable",
    );
  },
);
it("does not revive a captured preview after leaving and returning to the same workspace", () => {
  render(<SelectionContinuityLab />);
  select();
  expand();
  close();
  fireEvent.click(screen.getByText("Synthetic context controls"));
  fireEvent.click(screen.getByRole("button", { name: "Change workspace" }));
  fireEvent.click(screen.getByRole("button", { name: "Change workspace" }));
  expand();
  expect(
    screen.queryByRole("textbox", { name: "Exact local projection" }),
  ).toBeNull();
});
function Host({ current }: { current: SubjectContextCurrent }) {
  const [selection, setSelection] = useState<ObjectRef[]>([]);
  return (
    <SelectionReview
      current={current}
      selection={selection}
      onSelectionChange={setSelection}
    />
  );
}
it("excludes descriptor values, labels, unselected refs and binding secrets from the full projection", () => {
  const current = createSelectionFixtureHost().read();
  current.bindingKey = "private-host-key";
  current.descriptors[5].label = "Secret label sentinel";
  current.descriptors[5].field.basis = "Hidden field sentinel";
  render(<Host current={current} />);
  fireEvent.click(
    screen.getByRole("checkbox", { name: "Secret label sentinel" }),
  );
  expand();
  const expected = {
    ...current.context,
    selection: [current.descriptors[5].ref],
  };
  expect(projection()).toEqual(expected);
  const text = JSON.stringify(projection());
  for (const token of [
    "private-host-key",
    "Secret label sentinel",
    "Hidden field sentinel",
    current.descriptors[6].ref.id,
  ])
    expect(text).not.toContain(token);
});
it("rejects same-revision source changes and ambiguous data; unchanged rerenders retain refs", () => {
  const current = createSelectionFixtureHost().read();
  const { rerender } = render(<Host current={current} />);
  select();
  expand();
  const first = projection();
  rerender(<Host current={structuredClone(current)} />);
  expect(projection()).toEqual(first);
  const changed = structuredClone(current);
  changed.descriptors[5].ref.sourceVersionIds = ["synthetic:changed"];
  rerender(<Host current={changed} />);
  expect(
    screen.queryByRole("textbox", { name: "Exact local projection" }),
  ).toBeNull();
  const duplicate = structuredClone(current);
  duplicate.descriptors.push(duplicate.descriptors[5]);
  rerender(<Host current={duplicate} />);
  expect(
    screen.queryByRole("textbox", { name: "Exact local projection" }),
  ).toBeNull();
});
it("enforces eight selections across expanded and inline view", () => {
  render(<SelectionContinuityLab />);
  screen
    .getAllByRole("checkbox")
    .slice(0, 8)
    .forEach((e) => fireEvent.click(e));
  expand();
  const dialog = within(screen.getByRole("dialog"));
  expect(
    (dialog.getAllByRole("checkbox")[8] as HTMLInputElement).disabled,
  ).toBe(true);
  expect(projection().selection).toHaveLength(8);
  close();
  expect(
    (screen.getAllByRole("checkbox")[8] as HTMLInputElement).disabled,
  ).toBe(true);
});

it("retains exact refs when selected rows are filtered out of the visible list", () => {
  render(<SelectionContinuityLab />);
  select();
  fireEvent.change(
    screen.getByRole("textbox", { name: "Find in supplied records" }),
    { target: { value: "00006" } },
  );
  expect(screen.getAllByRole("checkbox")).toHaveLength(1);
  expand();
  expect(projection().selection[0].id).toBe("synthetic:recording:00005");
});
it.each(["purpose", "subject"])("rejects same-revision %s changes", (kind) => {
  const current = createSelectionFixtureHost().read();
  const { rerender } = render(<Host current={current} />);
  select();
  expand();
  const changed = structuredClone(current);
  if (kind === "purpose") changed.context.purpose = "inspect-sources";
  else changed.context.subject = changed.descriptors[1].ref;
  rerender(<Host current={changed} />);
  expect(
    screen.queryByRole("textbox", { name: "Exact local projection" }),
  ).toBeNull();
});
