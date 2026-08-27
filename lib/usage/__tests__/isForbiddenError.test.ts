import { describe, expect, it } from "vitest";
import isForbiddenError from "@/lib/usage/isForbiddenError";

describe("isForbiddenError", () => {
  it("is true only for an error carrying status 403", () => {
    expect(
      isForbiddenError(Object.assign(new Error("x"), { status: 403 })),
    ).toBe(true);
    expect(
      isForbiddenError(Object.assign(new Error("x"), { status: 500 })),
    ).toBe(false);
    expect(isForbiddenError(new Error("x"))).toBe(false);
    expect(isForbiddenError(null)).toBe(false);
  });
});
