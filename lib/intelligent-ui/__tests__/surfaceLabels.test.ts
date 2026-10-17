import { describe, expect, it } from "vitest";
import { surfaceSchema } from "../schema";
import { surfaceWithCollection } from "../presentation/__tests__/surfaceWithCollection";

describe("surface labels", () => {
  it.each([" ", "\t\n", "\u00a0"])(
    "rejects whitespace-only titles: %j",
    (title) => {
      expect(
        surfaceSchema.safeParse({ ...surfaceWithCollection(), title }).success,
      ).toBe(false);
    },
  );

  it("rejects blank record and column labels rather than rendering unlabeled comparisons", () => {
    const surface = surfaceWithCollection();
    const collection = surface.components[0];
    if (collection.type !== "collection")
      throw new Error("Expected collection");
    collection.rows[0].label = " ";
    expect(surfaceSchema.safeParse(surface).success).toBe(false);
    collection.rows[0].label = "Option one";
    collection.columns[0].label = "\t";
    expect(surfaceSchema.safeParse(surface).success).toBe(false);
  });

  it("preserves meaningful authored labels without rewriting their whitespace", () => {
    const surface = { ...surfaceWithCollection(), title: "  Example title  " };
    expect(surfaceSchema.parse(surface).title).toBe("  Example title  ");
  });
});
