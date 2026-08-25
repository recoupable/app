// @vitest-environment jsdom
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import CopyButton from "@/components/CopyButton";
import { toast } from "sonner";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe("CopyButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
  });

  it("copies the text", async () => {
    render(<CopyButton text="hello" label="prompt" />);

    fireEvent.click(screen.getByRole("button", { name: /copy prompt/i }));

    await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledWith("hello"));
  });

  it("toasts by default", async () => {
    render(<CopyButton text="hello" label="prompt" />);
    fireEvent.click(screen.getByRole("button", { name: /copy prompt/i }));

    await waitFor(() => expect(toast.success).toHaveBeenCalled());
  });

  it("stays quiet when silent", async () => {
    // The chat toolbar copies often, and its own tick is the confirmation.
    render(<CopyButton text="hello" label="response" silent />);
    fireEvent.click(screen.getByRole("button", { name: /copy response/i }));

    await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalled());
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("renders as a toolbar Action when given a tooltip", async () => {
    // Replaces the deleted CopyAction: same ghost, rounded, muted treatment as
    // the Retry and Edit controls it sits beside.
    render(
      <CopyButton text="hello" label="response" tooltip="Copy response to clipboard" silent />,
    );

    const button = screen.getByRole("button", { name: /copy response/i });
    expect(button.className).toMatch(/rounded-full/);
    fireEvent.click(button);

    await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledWith("hello"));
  });

  it("shows a label beside the icon when asked", () => {
    render(<CopyButton text="t" label="Token" showLabel />);

    expect(screen.getByRole("button", { name: /copy token/i }).textContent).toContain("Copy Token");
  });
});
