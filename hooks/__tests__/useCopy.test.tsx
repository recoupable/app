// @vitest-environment jsdom
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useCopy } from "@/hooks/useCopy";
import { toast } from "sonner";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const Probe = ({ silent }: { silent?: boolean }) => {
  const { copied, copy } = useCopy(2000, { silent });
  return (
    <button type="button" onClick={() => copy("hello")}>
      {copied ? "copied" : "copy"}
    </button>
  );
};

describe("useCopy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it("writes the text and reports copied", async () => {
    render(<Probe />);
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() =>
      expect(screen.getByRole("button").textContent).toBe("copied"),
    );
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("hello");
  });

  it("toasts by default", async () => {
    render(<Probe />);
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => expect(toast.success).toHaveBeenCalled());
  });

  it("stays quiet when silent, for callers that show their own confirmation", async () => {
    render(<Probe silent />);
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() =>
      expect(screen.getByRole("button").textContent).toBe("copied"),
    );
    expect(toast.success).not.toHaveBeenCalled();
  });
});
