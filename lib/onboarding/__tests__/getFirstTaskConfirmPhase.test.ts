import { describe, expect, it } from "vitest";
import { getFirstTaskConfirmPhase } from "@/lib/onboarding/getFirstTaskConfirmPhase";

describe("getFirstTaskConfirmPhase", () => {
  it("asks the one question by default", () => {
    expect(
      getFirstTaskConfirmPhase({
        decision: "pending",
        isCreating: false,
        hasTask: false,
      }),
    ).toBe("asking");
  });

  it("is creating while the POST /api/tasks mutation is in flight", () => {
    expect(
      getFirstTaskConfirmPhase({
        decision: "confirmed",
        isCreating: true,
        hasTask: false,
      }),
    ).toBe("creating");
  });

  it("is scheduled once the task row exists", () => {
    expect(
      getFirstTaskConfirmPhase({
        decision: "confirmed",
        isCreating: false,
        hasTask: true,
      }),
    ).toBe("scheduled");
  });

  it("is declined when the user says no — decline never creates a task", () => {
    expect(
      getFirstTaskConfirmPhase({
        decision: "declined",
        isCreating: false,
        hasTask: false,
      }),
    ).toBe("declined");
  });

  it("returns to asking after a failed create (confirmed but no task, not in flight)", () => {
    expect(
      getFirstTaskConfirmPhase({
        decision: "confirmed",
        isCreating: false,
        hasTask: false,
      }),
    ).toBe("asking");
  });
});
