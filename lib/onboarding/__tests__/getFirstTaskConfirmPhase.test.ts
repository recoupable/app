import { describe, expect, it } from "vitest";
import { getFirstTaskConfirmPhase } from "@/lib/onboarding/getFirstTaskConfirmPhase";

// The task is created automatically once the first report finishes
// (recoupable/app#1941); the user can turn it off, not opt in.
describe("getFirstTaskConfirmPhase", () => {
  it("is creating before the automatic create has started", () => {
    expect(
      getFirstTaskConfirmPhase({
        decision: "pending",
        isCreating: false,
        hasTask: false,
        autoCreate: true,
      }),
    ).toBe("creating");
  });

  // A second report in the same visit (another artist) offers, never auto-creates.
  it("offers instead when the account already has an active task", () => {
    expect(
      getFirstTaskConfirmPhase({
        decision: "pending",
        isCreating: false,
        hasTask: false,
        autoCreate: false,
      }),
    ).toBe("offer");
  });

  it("is creating while the POST /api/tasks mutation is in flight", () => {
    expect(
      getFirstTaskConfirmPhase({
        decision: "confirmed",
        isCreating: true,
        hasTask: false,
        autoCreate: true,
      }),
    ).toBe("creating");
  });

  it("is scheduled once the task row exists", () => {
    expect(
      getFirstTaskConfirmPhase({
        decision: "confirmed",
        isCreating: false,
        hasTask: true,
        autoCreate: true,
      }),
    ).toBe("scheduled");
  });

  it("is turned off once the user removes the created task", () => {
    expect(
      getFirstTaskConfirmPhase({
        decision: "declined",
        isCreating: false,
        hasTask: false,
        autoCreate: true,
      }),
    ).toBe("declined");
  });

  it("is failed after a create that produced no task, so the user can retry", () => {
    expect(
      getFirstTaskConfirmPhase({
        decision: "confirmed",
        isCreating: false,
        hasTask: false,
        autoCreate: true,
      }),
    ).toBe("failed");
  });
});
