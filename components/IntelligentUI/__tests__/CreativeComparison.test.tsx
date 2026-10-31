// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import CreativeComparison from "../CreativeComparison";
import CreativeComparisonLab from "../CreativeComparisonLab";
import { creativeFixtures } from "@/lib/intelligent-ui/playground/creative/creativeFixtures";
const first = creativeFixtures[0];
const second = creativeFixtures[1];
const inspect = (label = first.label) => {
  fireEvent.click(screen.getByRole("button", { name: `Inspect ${label}` }));
  fireEvent.load(screen.getAllByRole("img").at(-1)!);
};
const choose = (label = first.label) =>
  fireEvent.click(screen.getByRole("button", { name: `Choose ${label}` }));
const notes = (label = first.label) =>
  screen.getByRole("textbox", {
    name: `Notes for ${label}`,
  }) as HTMLTextAreaElement;
const reference = () =>
  screen.queryByRole("textbox", {
    name: "Read-only local follow-up reference",
  }) as HTMLTextAreaElement | null;
beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
it("loads media only on inspection and restores exact selection and notes after remount without sending or copying", () => {
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  const view = render(
    <CreativeComparison scope="one" assets={creativeFixtures} />,
  );
  expect(screen.queryByRole("img")).toBeNull();
  expect(
    (
      screen.getByRole("button", {
        name: `Choose ${first.label}`,
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
  inspect();
  choose();
  fireEvent.change(notes(), { target: { value: "Keep the lettering" } });
  const captured = JSON.parse(reference()!.value);
  expect(captured.selection).toEqual(first.ref);
  expect(captured).not.toHaveProperty("notes");
  expect(reference()!.value).not.toContain("/brand/");
  view.unmount();
  render(<CreativeComparison scope="one" assets={creativeFixtures} />);
  expect(notes().value).toBe("Keep the lettering");
  expect(reference()).toBeNull();
  inspect();
  expect(JSON.parse(reference()!.value)).toEqual(captured);
  expect(fetch).not.toHaveBeenCalled();
});
it.each(["processing", "unavailable", "withdrawn"] as const)(
  "refuses a selected %s revision while retaining its exact note",
  (status) => {
    const view = render(
      <CreativeComparison scope="one" assets={creativeFixtures} />,
    );
    inspect();
    choose();
    fireEvent.change(notes(), { target: { value: "Original note" } });
    view.rerender(
      <CreativeComparison
        scope="one"
        assets={[{ ...first, status }, second]}
      />,
    );
    expect(reference()).toBeNull();
    expect(screen.queryByRole("img")).toBeNull();
    expect(notes().value).toBe("Original note");
    expect(
      screen
        .getAllByRole("status")
        .some((el) => el.textContent?.includes("stored choice is unavailable")),
    ).toBe(true);
  },
);
it("does not remap stale selected revisions or copy their notes into a replacement", () => {
  const view = render(
    <CreativeComparison scope="one" assets={creativeFixtures} />,
  );
  inspect();
  choose();
  fireEvent.change(notes(), { target: { value: "Old revision only" } });
  view.rerender(
    <CreativeComparison
      scope="one"
      assets={[
        { ...first, ref: { ...first.ref, version: "a".repeat(64) } },
        second,
      ]}
    />,
  );
  expect(reference()).toBeNull();
  expect(notes().value).toBe("");
  expect(screen.queryByRole("img")).toBeNull();
});
it("isolates same-asset different-version notes and workspace drafts", () => {
  const view = render(
    <CreativeComparison scope="one" assets={creativeFixtures} />,
  );
  fireEvent.change(notes(), { target: { value: "Light only" } });
  fireEvent.change(notes(second.label), { target: { value: "Dark only" } });
  expect(notes().value).toBe("Light only");
  view.rerender(<CreativeComparison scope="two" assets={creativeFixtures} />);
  expect(notes().value).toBe("");
  expect(notes(second.label).value).toBe("");
  fireEvent.change(notes(), { target: { value: "Scope two" } });
  view.rerender(<CreativeComparison scope="one" assets={creativeFixtures} />);
  expect(notes().value).toBe("Light only");
  expect(notes(second.label).value).toBe("Dark only");
});
it("invalidates a selected reference on an actual image error", () => {
  render(<CreativeComparison scope="one" assets={creativeFixtures} />);
  inspect();
  choose();
  expect(reference()).not.toBeNull();
  fireEvent.error(screen.getByRole("img"));
  expect(reference()).toBeNull();
  expect(screen.queryByRole("img")).toBeNull();
  expect(
    screen
      .getAllByRole("status")
      .some((el) => el.textContent?.includes("Preview unavailable")),
  ).toBe(true);
});
it("retains in-memory notes and reports unavailable browser storage", () => {
  vi.stubGlobal("localStorage", {
    getItem: () => {
      throw new Error("denied");
    },
    setItem: () => {
      throw new Error("denied");
    },
  });
  render(<CreativeComparison scope="one" assets={creativeFixtures} />);
  fireEvent.change(notes(), { target: { value: "Memory only" } });
  expect(notes().value).toBe("Memory only");
  expect(screen.getByRole("status").textContent).toContain(
    "Browser storage unavailable",
  );
});
it("fails closed outside the development gate", () => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT", "true");
  render(<CreativeComparisonLab />);
  expect(screen.queryByRole("heading")).toBeNull();
});

it("requires fresh inspection after a revision becomes available again", () => {
  const view = render(
    <CreativeComparison scope="one" assets={creativeFixtures} />,
  );
  inspect();
  choose();
  view.rerender(
    <CreativeComparison
      scope="one"
      assets={[{ ...first, status: "withdrawn" }, second]}
    />,
  );
  view.rerender(<CreativeComparison scope="one" assets={creativeFixtures} />);
  expect(reference()).toBeNull();
  inspect();
  expect(reference()).not.toBeNull();
});
