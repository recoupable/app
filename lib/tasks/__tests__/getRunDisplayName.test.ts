import { describe, it, expect } from "vitest";
import { getRunDisplayName } from "../getRunDisplayName";

describe("getRunDisplayName", () => {
  it("returns the run title when present", () => {
    expect(
      getRunDisplayName({
        title: "Weekly valuation + streams report",
        taskIdentifier: "customer-prompt-task",
      }),
    ).toBe("Weekly valuation + streams report");
  });

  it("falls back to the task display name when title is null", () => {
    expect(
      getRunDisplayName({
        title: null,
        taskIdentifier: "customer-prompt-task",
      }),
    ).toBe("Scheduled Task");
  });

  it("falls back to the task display name when title is absent (pre-title api)", () => {
    expect(getRunDisplayName({ taskIdentifier: "customer-prompt-task" })).toBe(
      "Scheduled Task",
    );
  });

  it("falls back to the task display name when title is empty", () => {
    expect(
      getRunDisplayName({ title: "", taskIdentifier: "setup-sandbox" }),
    ).toBe("Setup Sandbox");
  });

  it("falls back to the raw identifier for unmapped tasks without a title", () => {
    expect(
      getRunDisplayName({ title: null, taskIdentifier: "unknown-task" }),
    ).toBe("unknown-task");
  });
});

// chat#1958: a run that sent an email is named by that email's subject.
describe("email subject preference (chat#1958)", () => {
  it("prefers email_subject over title and the generic label", () => {
    expect(
      getRunDisplayName({
        email_subject: "Your weekly report — Aug 13",
        title: "Weekly valuation",
        taskIdentifier: "customer-prompt-task",
      }),
    ).toBe("Your weekly report — Aug 13");
  });

  it("falls back to title when email_subject is null", () => {
    expect(
      getRunDisplayName({
        email_subject: null,
        title: "Weekly valuation",
        taskIdentifier: "customer-prompt-task",
      }),
    ).toBe("Weekly valuation");
  });
});
