import { describe, it, expect, vi, beforeEach } from "vitest";
import { triggerSandboxSetup } from "../triggerSandboxSetup";

const mockFetch = vi.fn().mockResolvedValue({ ok: true });

beforeEach(() => {
  vi.clearAllMocks();
  global.fetch = mockFetch;
});

describe("triggerSandboxSetup", () => {
  it("calls POST /api/sandboxes/setup with account_id", () => {
    triggerSandboxSetup("acc_123");

    expect(mockFetch).toHaveBeenCalledWith("/api/sandboxes/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ account_id: "acc_123" }),
    });
  });

  it("does not throw when fetch rejects", () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));
    expect(() => triggerSandboxSetup("acc_123")).not.toThrow();
  });
});
