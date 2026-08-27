import { describe, expect, it } from "vitest";
import { getTaskErrorMessage } from "@/lib/tasks/getTaskErrorMessage";

describe("getTaskErrorMessage", () => {
  it("unwraps the API error from an HTTP <code>: <json> message", () => {
    const err = new Error(
      'HTTP 403: {"status":"error","error":"Access denied to this task"}',
    );
    expect(getTaskErrorMessage(err, "fallback")).toBe(
      "Access denied to this task",
    );
  });
  it("uses a plain error message as-is", () => {
    expect(
      getTaskErrorMessage(new Error("Access denied to this task"), "fallback"),
    ).toBe("Access denied to this task");
  });
  it("falls back when there is no usable message", () => {
    expect(getTaskErrorMessage(new Error(""), "fallback")).toBe("fallback");
    expect(getTaskErrorMessage("nope", "fallback")).toBe("fallback");
  });
});
