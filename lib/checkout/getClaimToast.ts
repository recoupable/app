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
  return {
    kind: "error",
    text: "We could not link your subscription to this account. Write to agent@recoupable.dev and we will sort it out.",
  };
}
