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

it("lets a current scope replace an obsolete wait without the old finally releasing its lock", async () => {
  const submit = createChatSubmissionGuard();
  let current = true;
  let releaseOld!: () => void;
  let releaseNew!: () => void;
  const old = submit(
    () =>
      new Promise<void>((resolve) => {
        releaseOld = resolve;
      }),
    () => current,
  );
  current = false;
  const next = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        releaseNew = resolve;
      }),
  );
  const newer = submit(next, () => true);
  expect(next).toHaveBeenCalledOnce();
  releaseOld();
  await old;
  const duplicate = vi.fn(async () => {});
  await submit(duplicate);
  expect(duplicate).not.toHaveBeenCalled();
  releaseNew();
  await newer;
  await submit(duplicate);
  expect(duplicate).toHaveBeenCalledOnce();
});
