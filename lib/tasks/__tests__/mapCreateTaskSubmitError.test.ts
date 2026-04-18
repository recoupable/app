import { describe, expect, it } from "vitest";
import { mapCreateTaskSubmitError } from "@/lib/tasks/mapCreateTaskSubmitError";

describe("mapCreateTaskSubmitError", () => {
  it("rewrites HTTP 500 messages", () => {
    expect(mapCreateTaskSubmitError("HTTP 500: oops")).toContain("schedule preset");
  });

  it("passes through other messages", () => {
    expect(mapCreateTaskSubmitError("Network down")).toBe("Network down");
  });
});
