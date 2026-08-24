// @vitest-environment jsdom
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import AccountIdDisplay from "@/components/ArtistSetting/AccountIdDisplay";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const ACCOUNT_ID = "550e8400-e29b-41d4-a716-446655440000";

describe("AccountIdDisplay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
  });

  // Five call sites render this, so the visible output must not move.
  it("shows the default label and the truncated id", () => {
    render(<AccountIdDisplay accountId={ACCOUNT_ID} />);

    expect(screen.getByText("Artist ID")).toBeDefined();
    expect(screen.getByText("550e84...440000")).toBeDefined();
  });

  it("accepts a custom label", () => {
    render(<AccountIdDisplay accountId={ACCOUNT_ID} label="Account ID" />);

    expect(screen.getByText("Account ID")).toBeDefined();
  });

  it("leaves a short id untruncated", () => {
    render(<AccountIdDisplay accountId="abc123" />);

    expect(screen.getByText("abc123")).toBeDefined();
  });

  it("copies the full id, not the truncated one", async () => {
    render(<AccountIdDisplay accountId={ACCOUNT_ID} />);

    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledWith(ACCOUNT_ID));
  });

  it("keeps the id inside the click target", () => {
    // The whole chip is one button: the id text and the icon are both part of
    // it. Swapping in a bare icon button would shrink the click target.
    render(<AccountIdDisplay accountId={ACCOUNT_ID} />);

    const button = screen.getByRole("button");
    expect(button.textContent).toContain("550e84...440000");
  });
});
