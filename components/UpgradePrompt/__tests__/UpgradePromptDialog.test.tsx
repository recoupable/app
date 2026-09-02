// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import UpgradePromptDialog from "@/components/UpgradePrompt/UpgradePromptDialog";
import { trackEvent } from "@/lib/analytics/trackEvent";

vi.mock("@/lib/analytics/trackEvent", () => ({ trackEvent: vi.fn() }));

const copy = {
  headline: "1 of 1 tasks",
  sub: "on the Free plan",
  ratio: 1,
  body: "Free includes 1 task and it is already running.",
};

describe("UpgradePromptDialog", () => {
  beforeEach(() => vi.clearAllMocks());

  it("uses the shared dialog shell with accessible title and description", () => {
    render(
      <UpgradePromptDialog
        open
        onOpenChange={vi.fn()}
        trigger="task_count"
        copy={copy}
        onUpgrade={vi.fn()}
        onDismiss={vi.fn()}
      />,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog.getAttribute("aria-describedby")).not.toBeNull();
    expect(screen.getByText("1 of 1 tasks")).toBeDefined();
    expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual([
      "Upgrade",
      "Keep Free",
      "Close",
    ]);
    expect(trackEvent).toHaveBeenCalledWith("upgrade_prompt_shown", { trigger: "task_count" });
  });

  it("Upgrade and Keep Free call through", () => {
    const onUpgrade = vi.fn();
    const onDismiss = vi.fn();
    render(
      <UpgradePromptDialog
        open
        onOpenChange={vi.fn()}
        trigger="task_count"
        copy={copy}
        onUpgrade={onUpgrade}
        onDismiss={onDismiss}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Upgrade" }));
    expect(onUpgrade).toHaveBeenCalledWith("task_count");
    fireEvent.click(screen.getByRole("button", { name: "Keep Free" }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
