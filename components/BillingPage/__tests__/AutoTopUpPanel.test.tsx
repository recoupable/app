// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AutoTopUpPanel from "@/components/BillingPage/AutoTopUpPanel";

const settings = {
  account_id: "acct-1",
  enabled: true,
  amountCents: 10000,
  thresholdCents: 100,
  lastRunAt: null,
  lastError: null,
};

describe("AutoTopUpPanel", () => {
  it("is disabled with a hint when there is no card", () => {
    render(
      <AutoTopUpPanel
        settings={settings}
        hasCard={false}
        balanceUsd="$12.40"
        onSave={vi.fn()}
        isSaving={false}
        error={null}
      />,
    );
    expect(screen.getByText(/Add a card first/)).toBeTruthy();
    expect(screen.getByRole("switch").getAttribute("disabled")).not.toBeNull();
    expect(screen.queryByRole("button", { name: "Save" })).toBeNull();
  });

  it("shows the settings in dollars and saves them back in cents", () => {
    const onSave = vi.fn();
    render(
      <AutoTopUpPanel
        settings={settings}
        hasCard={true}
        balanceUsd="$12.40"
        onSave={onSave}
        isSaving={false}
        error={null}
      />,
    );
    expect(screen.getByText(/Current balance \$12\.40/)).toBeTruthy();
    const amount = screen.getByLabelText("Top up by") as HTMLInputElement;
    const threshold = screen.getByLabelText(
      "When balance drops below",
    ) as HTMLInputElement;
    expect(amount.value).toBe("100.00");
    expect(threshold.value).toBe("1.00");
    fireEvent.change(amount, { target: { value: "50" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onSave).toHaveBeenCalledWith({
      enabled: true,
      amountCents: 5000,
      thresholdCents: 100,
    });
  });

  it("renders the api error under the fields", () => {
    render(
      <AutoTopUpPanel
        settings={settings}
        hasCard={true}
        balanceUsd="$12.40"
        onSave={vi.fn()}
        isSaving={false}
        error="Your card was declined."
      />,
    );
    expect(screen.getByText("Your card was declined.")).toBeTruthy();
  });

  it("marks the error as an alert so screen readers announce it", () => {
    render(
      <AutoTopUpPanel
        settings={settings}
        hasCard={true}
        balanceUsd="$12.40"
        onSave={vi.fn()}
        isSaving={false}
        error="Your card was declined."
      />,
    );
    expect(screen.getByRole("alert").textContent).toContain(
      "Your card was declined.",
    );
  });

  it("disables Save with a message when a field is empty or not a number", () => {
    const onSave = vi.fn();
    render(
      <AutoTopUpPanel
        settings={settings}
        hasCard={true}
        balanceUsd="$12.40"
        onSave={onSave}
        isSaving={false}
        error={null}
      />,
    );
    fireEvent.change(screen.getByLabelText("Top up by"), {
      target: { value: "" },
    });
    expect(
      (screen.getByRole("button", { name: "Save" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    expect(screen.getByText(/Enter a top-up amount/)).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Top up by"), {
      target: { value: "abc" },
    });
    expect(
      (screen.getByRole("button", { name: "Save" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("enforces the 5.00 to 1,000.00 amount range and threshold below amount", () => {
    render(
      <AutoTopUpPanel
        settings={settings}
        hasCard={true}
        balanceUsd="$12.40"
        onSave={vi.fn()}
        isSaving={false}
        error={null}
      />,
    );
    fireEvent.change(screen.getByLabelText("Top up by"), {
      target: { value: "3" },
    });
    expect(screen.getByText(/between \$5\.00 and \$1,000\.00/)).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Top up by"), {
      target: { value: "50" },
    });
    fireEvent.change(screen.getByLabelText("When balance drops below"), {
      target: { value: "50" },
    });
    expect(screen.getByText(/below the top-up amount/)).toBeTruthy();
    expect(
      (screen.getByRole("button", { name: "Save" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  });
});
