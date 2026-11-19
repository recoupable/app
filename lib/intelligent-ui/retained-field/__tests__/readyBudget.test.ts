import { expect, it } from "vitest";
import { consumeRetainedField } from "../consumeRetainedField";
import { projectRetainedField } from "../projectRetainedField";
import { fieldContextSchema } from "../schemas";
import { fitsRetainedFieldBudget } from "../fitsRetainedFieldBudget";
import { fixture } from "./fixture";
import { id } from "./id";

it("withholds a valid eight-item projection whose complete ready JSON exceeds 32 KiB", () => {
  const f = fixture();
  const context = f.part.data.fieldContext;
  const original = structuredClone(context.items[0]);
  context.items = Array.from({ length: 8 }, (_, n) => {
    const item = structuredClone(original);
    item.binding.subjectId = id(100 + n);
    item.binding.resultId = id(200 + n);
    item.binding.sourceVersionIds = [id(300 + n)];
    item.ref.id = item.binding.subjectId;
    item.ref.sourceVersionIds = [...item.binding.sourceVersionIds];
    item.source.retrievalRange.earliest = `2026-10-03T01:00:00.${"0".repeat(40)}Z`;
    item.source.retrievalRange.latest = `2026-10-03T02:00:00.${"0".repeat(40)}Z`;
    return item;
  });
  expect(fieldContextSchema.safeParse(context).success).toBe(true);
  f.admission.request.selections = structuredClone(
    context.items.map((item) => item.binding),
  );
  const projection = projectRetainedField(context, "retained-1", 1);
  f.part.data.surface = projection.surface;
  expect(fitsRetainedFieldBudget("ready", { state: "ready", ...context })).toBe(
    true,
  );
  expect(fitsRetainedFieldBudget("part", f.part)).toBe(true);
  expect(fitsRetainedFieldBudget("text", projection.text)).toBe(true);
  const bytes = new TextEncoder().encode(
    JSON.stringify({ state: "ready", fieldContext: context, ...projection }),
  ).byteLength;
  expect(bytes).toBeGreaterThan(32 * 1024);
  expect(consumeRetainedField(f.part, f.admission)).toEqual({
    state: "unavailable",
  });
});

it("measures complete ready-shaped objects at exact multibyte JSON boundaries", () => {
  const object = {
    state: "ready",
    fieldContext: {},
    collection: {},
    surface: {},
    text: "",
    descriptors: [],
  };
  const overhead = new TextEncoder().encode(JSON.stringify(object)).byteLength;
  const remaining = 32 * 1024 - overhead;
  object.text =
    "界".repeat(Math.floor(remaining / 3)) + "x".repeat(remaining % 3);
  expect(new TextEncoder().encode(JSON.stringify(object)).byteLength).toBe(
    32 * 1024,
  );
  expect(fitsRetainedFieldBudget("ready", object)).toBe(true);
  expect(
    fitsRetainedFieldBudget("ready", { ...object, text: object.text + "x" }),
  ).toBe(false);
  expect(
    fitsRetainedFieldBudget("ready", { ...object, text: object.text + "界" }),
  ).toBe(false);
});
