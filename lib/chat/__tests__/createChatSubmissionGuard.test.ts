import { describe, expect, it, vi } from "vitest";
import { createChatSubmissionGuard } from "../createChatSubmissionGuard";

describe("createChatSubmissionGuard", () => {
  it("ignores overlapping submissions before async preparation finishes", async () => {
    const submit = createChatSubmissionGuard();
    let release!: () => void;
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    const first = vi.fn(() => pending);
    const duplicate = vi.fn(async () => {});
    const running = submit(first);
    await submit(duplicate);
    expect(first).toHaveBeenCalledOnce();
    expect(duplicate).not.toHaveBeenCalled();
    release();
    await running;
    await submit(duplicate);
    expect(duplicate).toHaveBeenCalledOnce();
  });

  it("allows retry after preparation fails", async () => {
    const submit = createChatSubmissionGuard();
    await expect(
      submit(async () => {
        throw new Error("auth failed");
      }),
    ).rejects.toThrow("auth failed");
    const retry = vi.fn(async () => {});
    await submit(retry);
    expect(retry).toHaveBeenCalledOnce();
  });
});
