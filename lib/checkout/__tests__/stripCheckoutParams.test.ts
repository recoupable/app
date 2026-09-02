import { describe, expect, it } from "vitest";
import { stripCheckoutParams } from "@/lib/checkout/stripCheckoutParams";

describe("stripCheckoutParams", () => {
  it("removes only the checkout params and keeps the rest of the URL", () => {
    expect(stripCheckoutParams("/tasks", new URLSearchParams("checkout=success&session_id=cs_1&q=hi"))).toBe(
      "/tasks?q=hi",
    );
  });

  it("drops the question mark when nothing is left", () => {
    expect(stripCheckoutParams("/", new URLSearchParams("checkout=success&session_id=cs_1"))).toBe("/");
  });
});
