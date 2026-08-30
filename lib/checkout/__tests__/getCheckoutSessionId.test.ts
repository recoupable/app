import { describe, expect, it } from "vitest";
import { getCheckoutSessionId } from "@/lib/checkout/getCheckoutSessionId";

describe("getCheckoutSessionId", () => {
  it("reads the session id from a Stripe success redirect", () => {
    expect(getCheckoutSessionId(new URLSearchParams("checkout=success&session_id=cs_test_1"))).toBe(
      "cs_test_1",
    );
  });

  it("is null without the success marker or without an id", () => {
    expect(getCheckoutSessionId(new URLSearchParams("session_id=cs_test_1"))).toBeNull();
    expect(getCheckoutSessionId(new URLSearchParams("checkout=success"))).toBeNull();
    expect(getCheckoutSessionId(new URLSearchParams(""))).toBeNull();
  });
});
