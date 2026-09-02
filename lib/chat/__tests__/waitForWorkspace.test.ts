import { describe, it, expect, vi, afterEach } from "vitest";
import { waitForWorkspace } from "@/lib/chat/waitForWorkspace";
import type { WorkspaceStatus } from "@/components/VercelChat/WorkspaceStatusIndicator";

describe("waitForWorkspace", () => {
  afterEach(() => vi.useRealTimers());

  it("resolves at once when the workspace is already ready", async () => {
    await expect(waitForWorkspace(() => "ready")).resolves.toBeUndefined();
  });

  it("holds while provisioning and resolves once the status flips to ready", async () => {
    vi.useFakeTimers();
    let status: WorkspaceStatus = "provisioning";
    let settled = false;
    const wait = waitForWorkspace(() => status, 100).then(() => {
      settled = true;
    });
    await vi.advanceTimersByTimeAsync(350);
    expect(settled).toBe(false);
    status = "ready";
    await vi.advanceTimersByTimeAsync(100);
    await wait;
    expect(settled).toBe(true);
  });

  it("rejects when provisioning fails, so the send errors instead of hanging", async () => {
    vi.useFakeTimers();
    let status: WorkspaceStatus = "provisioning";
    const wait = waitForWorkspace(() => status, 100);
    const outcome = wait.catch((e: Error) => e.message);
    status = "off";
    await vi.advanceTimersByTimeAsync(100);
    await expect(outcome).resolves.toMatch(/failed to start/i);
  });
});
