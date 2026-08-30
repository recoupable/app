import { describe, expect, it } from "vitest";
import { isTransientClaimFailure } from "@/lib/checkout/isTransientClaimFailure";

describe("isTransientClaimFailure", () => {
  it("retries network errors, 5xx, and a missing token", () => {
    expect(isTransientClaimFailure(new TypeError("Failed to fetch"))).toBe(true);
    expect(isTransientClaimFailure(new Error("HTTP 503"))).toBe(true);
    expect(isTransientClaimFailure(new Error("no_token"))).toBe(true);
    expect(isTransientClaimFailure("weird")).toBe(true);
  });

  it("retires the session on a final answer from the api", () => {
    expect(isTransientClaimFailure(new Error("already_claimed"))).toBe(false);
    expect(isTransientClaimFailure(new Error("not_found"))).toBe(false);
    expect(isTransientClaimFailure(new Error("HTTP 404"))).toBe(false);
  });
});
