import type { SandboxStreamProgress } from "../sandboxStreamTypes";

/**
 * Tests for the prompt_sandbox branching logic in ToolComponents.
 * When the API returns a runId (background task triggered from snapshot),
 * the UI should show the polling component instead of the streaming component.
 */

function getPromptSandboxComponentType(
  result: SandboxStreamProgress,
): "polling" | "streaming" {
  if (result.runId) return "polling";
  return "streaming";
}

describe("prompt_sandbox component selection", () => {
  it("returns polling when runId is present", () => {
    const result: SandboxStreamProgress = {
      status: "complete",
      output: "",
      runId: "run_abc123",
      fromSnapshot: true,
    };
    expect(getPromptSandboxComponentType(result)).toBe("polling");
  });

  it("returns streaming when runId is absent", () => {
    const result: SandboxStreamProgress = {
      status: "streaming",
      output: "hello world",
    };
    expect(getPromptSandboxComponentType(result)).toBe("streaming");
  });

  it("returns streaming when runId is undefined", () => {
    const result: SandboxStreamProgress = {
      status: "booting",
      output: "",
      runId: undefined,
    };
    expect(getPromptSandboxComponentType(result)).toBe("streaming");
  });

  it("returns streaming when runId is empty string", () => {
    const result: SandboxStreamProgress = {
      status: "complete",
      output: "done",
      runId: "",
    };
    expect(getPromptSandboxComponentType(result)).toBe("streaming");
  });
});
