// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useReportRunDecision } from "@/hooks/useReportRunDecision";

type Props = { runKey: string | undefined; autoCreate: boolean };
const render = (initialProps: Props) =>
  renderHook(
    ({ runKey, autoCreate }: Props) => useReportRunDecision(runKey, autoCreate),
    {
      initialProps,
    },
  );

describe("useReportRunDecision", () => {
  it("keeps a run's decision when the live value flips", () => {
    const { result, rerender } = render({ runKey: "chat-1", autoCreate: true });
    rerender({ runKey: "chat-1", autoCreate: false });
    expect(result.current).toBe(true);
  });

  it("decides again for a new run", () => {
    const { result, rerender } = render({ runKey: "chat-1", autoCreate: true });
    rerender({ runKey: "chat-2", autoCreate: false });
    expect(result.current).toBe(false);
  });

  // Before the run has a chat there is nothing to pin to: follow the live value,
  // and capture whatever it is once the chat exists.
  it("follows the live value until the run has a key", () => {
    const { result, rerender } = render({
      runKey: undefined,
      autoCreate: true,
    });
    rerender({ runKey: undefined, autoCreate: false });
    expect(result.current).toBe(false);
    rerender({ runKey: "chat-1", autoCreate: false });
    rerender({ runKey: "chat-1", autoCreate: true });
    expect(result.current).toBe(false);
  });
});
