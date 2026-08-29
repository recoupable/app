// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import UpgradePrompt from "@/components/UpgradePrompt/UpgradePrompt";
import { trackEvent } from "@/lib/analytics/trackEvent";

vi.mock("@/lib/analytics/trackEvent", () => ({ trackEvent: vi.fn() }));

const copy = { title: "You have $0.20 left", body: "Your $3.33 is almost used up." };

describe("UpgradePrompt", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders the trigger copy and both plans side by side", () => {
    render(
      <UpgradePrompt trigger="credits_low" copy={copy} plans={["starter", "pro"]} onChoose={vi.fn()} onDismiss={vi.fn()} />,
    );
    expect(screen.getByText("You have $0.20 left")).toBeDefined();
    expect(screen.getByRole("button", { name: /Start Starter/ })).toBeDefined();
    expect(screen.getByRole("button", { name: /Start 30-day trial/ })).toBeDefined();
    expect(screen.getByText(/\$19 today/)).toBeDefined();
    expect(screen.getByText(/\$0 today/)).toBeDefined();
  });

  it("hides Starter when only Pro is offered", () => {
    render(<UpgradePrompt trigger="credits_low" copy={copy} plans={["pro"]} onChoose={vi.fn()} onDismiss={vi.fn()} />);
    expect(screen.queryByText(/\$19/)).toBeNull();
    expect(screen.getByRole("button", { name: /Start 30-day trial/ })).toBeDefined();
  });

  it("fires upgrade_prompt_shown again when the trigger changes on a mounted prompt", () => {
    const { rerender } = render(
      <UpgradePrompt trigger="credits_low" copy={copy} plans={["pro"]} onChoose={vi.fn()} onDismiss={vi.fn()} />,
    );
    rerender(<UpgradePrompt trigger="credits_exhausted" copy={copy} plans={["pro"]} onChoose={vi.fn()} onDismiss={vi.fn()} />);
    expect(trackEvent).toHaveBeenCalledTimes(2);
    expect(trackEvent).toHaveBeenLastCalledWith("upgrade_prompt_shown", { trigger: "credits_exhausted", plan_offered: "pro" });
  });

  it("fires upgrade_prompt_shown once on mount", () => {
    const { rerender } = render(
      <UpgradePrompt trigger="credits_exhausted" copy={copy} plans={["pro"]} onChoose={vi.fn()} onDismiss={vi.fn()} />,
    );
    rerender(<UpgradePrompt trigger="credits_exhausted" copy={copy} plans={["pro"]} onChoose={vi.fn()} onDismiss={vi.fn()} />);
    expect(trackEvent).toHaveBeenCalledTimes(1);
    expect(trackEvent).toHaveBeenCalledWith("upgrade_prompt_shown", { trigger: "credits_exhausted", plan_offered: "pro" });
  });

  it("choosing a plan tracks the click and hands the plan to the caller", () => {
    const onChoose = vi.fn();
    render(<UpgradePrompt trigger="credits_low" copy={copy} plans={["starter", "pro"]} onChoose={onChoose} onDismiss={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /Start Starter/ }));
    expect(onChoose).toHaveBeenCalledWith("starter");
    expect(trackEvent).toHaveBeenCalledWith("upgrade_prompt_clicked", { plan: "starter", trigger: "credits_low" });
  });

  it("Keep Free dismisses without tracking a click", () => {
    const onDismiss = vi.fn();
    render(<UpgradePrompt trigger="credits_low" copy={copy} plans={["pro"]} onChoose={vi.fn()} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole("button", { name: "Keep Free" }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(trackEvent).not.toHaveBeenCalledWith("upgrade_prompt_clicked", expect.anything());
  });
});
