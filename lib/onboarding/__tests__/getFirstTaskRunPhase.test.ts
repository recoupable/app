import { describe, expect, it } from "vitest";
import { getFirstTaskRunPhase } from "@/lib/onboarding/getFirstTaskRunPhase";

describe("getFirstTaskRunPhase", () => {
  it("is generating before the auto-send fires (idle chat, no report)", () => {
    expect(getFirstTaskRunPhase({ status: "ready", hasReport: false })).toBe(
      "generating",
    );
  });

  it("is generating while the send is submitted or streaming", () => {
    expect(
      getFirstTaskRunPhase({ status: "submitted", hasReport: false }),
    ).toBe("generating");
    expect(getFirstTaskRunPhase({ status: "streaming", hasReport: true })).toBe(
      "generating",
    );
  });

  it("is ready only when the stream finished with report text", () => {
    expect(getFirstTaskRunPhase({ status: "ready", hasReport: true })).toBe(
      "ready",
    );
  });

  it("is error when the chat transport errored", () => {
    expect(getFirstTaskRunPhase({ status: "error", hasReport: false })).toBe(
      "error",
    );
  });
});
