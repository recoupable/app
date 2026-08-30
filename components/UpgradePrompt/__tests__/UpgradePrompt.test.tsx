// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import UpgradePrompt from "@/components/UpgradePrompt/UpgradePrompt";
import { trackEvent } from "@/lib/analytics/trackEvent";

vi.mock("@/lib/analytics/trackEvent", () => ({ trackEvent: vi.fn() }));

const copy = { headline: "$0.20 left", sub: "of $3.33 this month", ratio: 0.06, body: "Your next report will use most of what is left." };

describe("UpgradePrompt", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders the big number, its context, the sentence, one Upgrade button and Keep Free", () => {
    render(<UpgradePrompt trigger="credits_low" copy={copy} onUpgrade={vi.fn()} onDismiss={vi.fn()} />);
    expect(screen.getByText("$0.20 left")).toBeDefined();
    expect(screen.getByText("of $3.33 this month")).toBeDefined();
    expect(screen.getByText(copy.body)).toBeDefined();
    expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual(["Upgrade", "Keep Free"]);
    expect(screen.queryByText(/\$19|\$99|Starter|trial/)).toBeNull();
  });

  it("fills the meter to the ratio", () => {
    render(<UpgradePrompt trigger="credits_low" copy={copy} onUpgrade={vi.fn()} onDismiss={vi.fn()} />);
    const meter = screen.getByRole("progressbar");
    expect(meter.getAttribute("aria-valuenow")).toBe("6");
  });

  it("fires upgrade_prompt_shown once per trigger, and again when the trigger changes", () => {
    const { rerender } = render(<UpgradePrompt trigger="credits_low" copy={copy} onUpgrade={vi.fn()} onDismiss={vi.fn()} />);
    rerender(<UpgradePrompt trigger="credits_low" copy={copy} onUpgrade={vi.fn()} onDismiss={vi.fn()} />);
    expect(trackEvent).toHaveBeenCalledTimes(1);
    expect(trackEvent).toHaveBeenCalledWith("upgrade_prompt_shown", { trigger: "credits_low" });
    rerender(<UpgradePrompt trigger="credits_exhausted" copy={copy} onUpgrade={vi.fn()} onDismiss={vi.fn()} />);
    expect(trackEvent).toHaveBeenCalledTimes(2);
  });

  it("Upgrade hands the trigger to the caller; Keep Free dismisses", () => {
    const onUpgrade = vi.fn();
    const onDismiss = vi.fn();
    render(<UpgradePrompt trigger="credits_low" copy={copy} onUpgrade={onUpgrade} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole("button", { name: "Upgrade" }));
    expect(onUpgrade).toHaveBeenCalledWith("credits_low");
    fireEvent.click(screen.getByRole("button", { name: "Keep Free" }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
