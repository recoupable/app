import { useRef } from "react";
import type { ReleaseCase } from "@/lib/releases/types";
import type { ReleaseCaseState } from "@/lib/releases/state";
import type { useReleaseCaseRequest } from "./useReleaseCaseRequest";
export function useReleaseCaseReview(
  current: ReleaseCase | null,
  scope: string,
  request: ReturnType<typeof useReleaseCaseRequest>,
  run: (
    work: (revision: number) => Promise<Partial<ReleaseCaseState>>,
  ) => Promise<void>,
) {
  const pendingReview = useRef<{ input: string; key: string } | null>(null);
  const review = (decision: "reviewed" | "needs_changes", note: string) =>
    run(async (revision) => {
      if (!current) throw new Error("Select a release");
      const body = {
        action: "review_release_case" as const,
        request_id: current.request_id,
        fingerprint: current.fingerprint,
        decision,
        note,
      };
      const input = JSON.stringify([scope, body]);
      if (pendingReview.current?.input !== input)
        pendingReview.current = { input, key: crypto.randomUUID() };
      const pending = pendingReview.current;
      await request({ ...body, idempotency_key: pending.key }, revision);
      if (pendingReview.current === pending) pendingReview.current = null;
      return {
        current: await request(
          {
            action: "read_release_case",
            request_id: current.request_id,
          },
          revision,
        ),
      };
    });
  return review;
}
