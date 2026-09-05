// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UnlockProCard from "@/components/Sidebar/UnlockProCard";

const startCheckout = vi.fn();
vi.mock("@/hooks/useUpgradeCheckout", () => ({
  useUpgradeCheckout: () => ({ startCheckout }),
}));
vi.mock("../Icon", () => ({ default: () => null }));

describe("UnlockProCard", () => {
  it("starts the Pro checkout through the shared hook and disables the button while pending", async () => {
    let resolve: () => void = () => undefined;
    startCheckout.mockReturnValue(
      new Promise<void>((r) => {
        resolve = r;
      }),
    );
    render(<UnlockProCard />);
    const button = screen.getByRole("button", {
      name: /Start Free Trial/,
    }) as HTMLButtonElement;
    fireEvent.click(button);
    expect(startCheckout).toHaveBeenCalledWith("pro");
    expect(button.disabled).toBe(true);
    fireEvent.click(button);
    expect(startCheckout).toHaveBeenCalledTimes(1);
    resolve();
    await waitFor(() => expect(button.disabled).toBe(false));
  });
});
