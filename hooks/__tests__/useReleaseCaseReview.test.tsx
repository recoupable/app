// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useReleaseCaseReview } from "../useReleaseCaseReview";
import type { useReleaseCaseRequest } from "../useReleaseCaseRequest";
import type { ReleaseCase } from "@/lib/releases/types";

afterEach(cleanup);

it("reuses an uncertain save key but creates a new key after success", async () => {
  const keys: string[] = [];
  const current = {
    request_id: "request",
    fingerprint: "a".repeat(64),
  } as ReleaseCase;
  const request = vi.fn(async (body: Record<string, unknown>) => {
    if (body.action === "review_release_case") {
      keys.push(body.idempotency_key as string);
      if (keys.length === 1) throw new Error("Connection lost");
      return { id: "receipt" };
    }
    return current;
  }) as unknown as ReturnType<typeof useReleaseCaseRequest>;
  const { result } = renderHook(() =>
    useReleaseCaseReview(current, "workspace", request, async (work) => {
      await work(0);
    }),
  );
  await act(async () => {
    await expect(result.current("reviewed", "Checked")).rejects.toThrow(
      "Connection lost",
    );
  });
  await act(async () => {
    await result.current("reviewed", "Checked");
  });
  await act(async () => {
    await result.current("reviewed", "Checked");
  });
  expect(keys).toHaveLength(3);
  expect(keys[1]).toBe(keys[0]);
  expect(keys[2]).not.toBe(keys[1]);
});
