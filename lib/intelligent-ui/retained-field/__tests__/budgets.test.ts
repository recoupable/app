import { expect, it } from "vitest";
import { fitsRetainedFieldBudget } from "../fitsRetainedFieldBudget";

it.each([
  ["part", 256 * 1024],
  ["ready", 32 * 1024],
  ["text", 24 * 1024],
] as const)(
  "enforces exact %s UTF-8 budget without truncation",
  (kind, cap) => {
    const quotes = kind === "text" ? 0 : 2;
    const available = cap - quotes;
    const exact =
      "界".repeat(Math.floor(available / 3)) + "x".repeat(available % 3);
    expect(exact.length).toBeLessThan(cap);
    expect(fitsRetainedFieldBudget(kind, exact)).toBe(true);
    expect(fitsRetainedFieldBudget(kind, exact + "x")).toBe(false);
    expect(fitsRetainedFieldBudget(kind, exact + "界")).toBe(false);
  },
);
it("refuses nonserializable payloads and nontext output", () => {
  const cycle: { self?: unknown } = {};
  cycle.self = cycle;
  expect(fitsRetainedFieldBudget("part", cycle)).toBe(false);
  expect(fitsRetainedFieldBudget("ready", undefined)).toBe(false);
  expect(fitsRetainedFieldBudget("text", {})).toBe(false);
});
