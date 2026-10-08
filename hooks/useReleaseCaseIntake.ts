import { useRef } from "react";
import type { ReleaseCaseState } from "@/lib/releases/state";
import { ReleaseCaseRequestError } from "@/lib/releases/errors";
import type { useReleaseCaseRequest } from "./useReleaseCaseRequest";

export function useReleaseCaseIntake(
  scope: string,
  request: ReturnType<typeof useReleaseCaseRequest>,
  run: (
    work: (revision: number) => Promise<Partial<ReleaseCaseState>>,
  ) => Promise<void>,
) {
  const pending = useRef<{ input: string; key: string } | null>(null);
  return (url: string) =>
    run(async (revision) => {
      const value = url.trim();
      const input = JSON.stringify([scope, value]);
      if (pending.current?.input !== input)
        pending.current = { input, key: crypto.randomUUID() };
      const submission = pending.current;
      await request(
        {
          action: "ingest_release",
          url: value,
          idempotency_key: submission.key,
        },
        revision,
      );
      const list = await request(
        { action: "list_release_cases" },
        revision,
      ).catch((error: unknown) => {
        // A failed access check must still clear previously loaded private data.
        const recovery =
          error instanceof ReleaseCaseRequestError
            ? error.message
            : "Refresh the list to check current evidence and access.";
        throw new ReleaseCaseRequestError(
          `Release URL saved, but the list could not be refreshed. ${recovery}`,
        );
      });
      if (pending.current === submission) pending.current = null;
      return {
        items: list.cases,
        nextId: list.next_id ?? null,
        loaded: true,
        current: null,
        notice:
          "Release URL saved. Metadata has not been collected by this action.",
      };
    });
}
