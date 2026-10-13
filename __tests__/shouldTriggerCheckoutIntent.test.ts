import { describe, it, expect } from "vitest";
import shouldTriggerCheckoutIntent from "@/lib/checkout/shouldTriggerCheckoutIntent";

const readyState = {
  intent: "pro-trial",
  ready: true,
  authenticated: true,
  hasAccount: true,
  alreadyTriggered: false,
};

describe("shouldTriggerCheckoutIntent", () => {
  it("returns checkout when a signed-in user lands with the pro-trial intent", () => {
    expect(shouldTriggerCheckoutIntent(readyState)).toBe("checkout");
  });

  it("returns login when the visitor is signed out", () => {
    expect(
      shouldTriggerCheckoutIntent({
        ...readyState,
        authenticated: false,
        hasAccount: false,
      }),
    ).toBe("login");
  });

  it("returns none when the intent param is absent", () => {
    expect(shouldTriggerCheckoutIntent({ ...readyState, intent: null })).toBe(
      "none",
    );
  });

  it("returns none for unknown intent values", () => {
    expect(
      shouldTriggerCheckoutIntent({ ...readyState, intent: "free-hats" }),
    ).toBe("none");
  });

  it("returns none while Privy is not ready", () => {
    expect(shouldTriggerCheckoutIntent({ ...readyState, ready: false })).toBe(
      "none",
    );
  });

  it("waits (none) when authenticated but the account has not loaded yet", () => {
    expect(
      shouldTriggerCheckoutIntent({ ...readyState, hasAccount: false }),
    ).toBe("none");
  });

  it("returns none once the intent was already handled", () => {
    expect(
      shouldTriggerCheckoutIntent({ ...readyState, alreadyTriggered: true }),
    ).toBe("none");
  });

  it("does not reprompt login after the intent was handled", () => {
    expect(
      shouldTriggerCheckoutIntent({
        ...readyState,
        authenticated: false,
        hasAccount: false,
        alreadyTriggered: true,
      }),
    ).toBe("none");
  });
});
