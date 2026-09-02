// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { UIMessage } from "ai";
import { MessageParts } from "@/components/VercelChat/MessageParts";

const message = (state: string, extra: Record<string, unknown> = {}) =>
  ({
    id: "m1",
    role: "assistant",
    parts: [
      {
        type: "tool-bash",
        toolCallId: "call-1",
        state,
        input: { command: "pnpm exec tsc --noEmit" },
        ...extra,
      },
    ],
  }) as unknown as UIMessage;

const renderParts = (m: UIMessage) =>
  render(<MessageParts message={m} mode="view" setMode={() => {}} status="ready" reload={() => {}} />);

describe("MessageParts — sandbox tool routing (app#2052)", () => {
  it("renders a terminal output-error as an error, not a spinner", () => {
    const { container } = renderParts(
      message("output-error", { errorText: "Sandbox not found: sbx_9f2c1a" }),
    );
    expect(container.querySelector(".animate-spin")).toBeNull();
    expect(screen.getByText("Bash")).toBeTruthy();
  });

  it("does not present a non-zero exit as a success", () => {
    renderParts(
      message("output-available", {
        output: { success: false, exitCode: 2, stdout: "", stderr: "error TS2345" },
      }),
    );
    expect(screen.getByText("exit 2")).toBeTruthy();
  });

  it("shows the command as the summary", () => {
    renderParts(message("output-available", { output: { success: true, exitCode: 0, stdout: "ok" } }));
    expect(screen.getByText("pnpm exec tsc --noEmit")).toBeTruthy();
  });
});
