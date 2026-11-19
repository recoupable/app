import { expect, it } from "vitest";
import { consumeRetainedField } from "../consumeRetainedField";
import { fixture } from "./fixture";

it("accepts identical parsed display records regardless of object key insertion order", () => {
  const f = fixture();
  expect(consumeRetainedField(f.part, f.admission).state).toBe("ready");
  const collection = f.part.data.surface.components[0];
  if (collection.type !== "collection") throw new Error("Expected collection");
  for (const row of collection.rows) {
    row.values = Object.fromEntries(Object.entries(row.values).reverse());
  }
  expect(consumeRetainedField(f.part, f.admission).state).toBe("ready");
});
it.each(["value", "rows", "columns"])(
  "still rejects a changed %s projection",
  (mode) => {
    const f = fixture();
    const collection = f.part.data.surface.components[0];
    if (collection.type !== "collection")
      throw new Error("Expected collection");
    for (const row of collection.rows)
      row.values = Object.fromEntries(Object.entries(row.values).reverse());
    if (mode === "value") collection.rows[0].values.value = "1000 streams";
    if (mode === "rows") collection.rows.reverse();
    if (mode === "columns") collection.columns.reverse();
    expect(consumeRetainedField(f.part, f.admission)).toEqual({
      state: "unavailable",
    });
  },
);
