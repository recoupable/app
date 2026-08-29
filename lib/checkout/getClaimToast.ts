const PLAN_NAMES = { starter: "Starter", pro: "Pro" } as const;

/** The toast after a claim attempt, worded for the customer. */
export function getClaimToast(
  result: { ok: true; plan: "starter" | "pro" } | { ok: false; code: string },
): { kind: "success" | "error"; text: string } {
  if (result.ok) {
    return { kind: "success", text: `Your ${PLAN_NAMES[result.plan]} subscription is on this account.` };
  }
  if (result.code === "already_claimed") {
    return {
      kind: "error",
      text: "That subscription is already on another account. Sign in with the email you paid with, or write to agent@recoupable.dev.",
    };
  }
  if (result.code === "no_token" || /^HTTP 5/.test(result.code) || result.code === "unknown") {
    return {
      kind: "error",
      text: "We could not reach the server to link your subscription. Reload this page to try again.",
    };
  }
  return {
    kind: "error",
    text: "We could not link your subscription to this account. Write to agent@recoupable.dev and we will sort it out.",
  };
}
