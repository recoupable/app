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

  it("applies the caller's chrome, so a toolbar can match its neighbours", () => {
    // CopyButton is always a Button; callers that need different chrome pass
    // it in. The chat toolbar passes Action's treatment so Copy sits level
    // with Retry and Edit.
    render(
      <CopyButton
        text="hello"
        label="response"
        className="size-8 rounded-full text-muted-foreground"
        silent
      />,
    );

    const button = screen.getByRole("button", { name: /copy response/i });
    expect(button.className).toMatch(/rounded-full/);
    expect(button.className).toMatch(/size-8/);
  });

  it("wraps in a tooltip trigger when given a tooltip", async () => {
    render(<CopyButton text="hello" label="response" tooltip="Copy response to clipboard" silent />);

    const button = screen.getByRole("button", { name: /copy response/i });
    expect(button.getAttribute("data-slot") ?? button.closest("[data-state]")).toBeTruthy();
    fireEvent.click(button);

    await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledWith("hello"));
  });

  it("shows a label beside the icon when asked", () => {
    render(<CopyButton text="t" label="Token" showLabel />);

    expect(screen.getByRole("button", { name: /copy token/i }).textContent).toContain("Copy Token");
  });
});
