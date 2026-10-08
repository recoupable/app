"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReleaseCase, ReleaseCaseItem } from "@/lib/releases/types";
interface Options {
  accountId: string | null;
  organizationId: string | null;
  getAccessToken: () => Promise<string | null>;
}
interface State {
  scope: string;
  items: ReleaseCaseItem[];
  nextId: string | null;
  current: ReleaseCase | null;
  busy: boolean;
  error: string;
  loaded: boolean;
}
const empty = (scope: string): State => ({
  scope,
  items: [],
  nextId: null,
  current: null,
  busy: false,
  error: "",
  loaded: false,
});
/** Keep private responses and in-flight writes bound to the selected account/workspace. */
export function useReleaseCases({
  accountId,
  organizationId,
  getAccessToken,
}: Options) {
  const scope = JSON.stringify([accountId, organizationId]);
  const [state, setState] = useState<State>(() => empty(scope));
  const generation = useRef(0);
  const tokenReader = useRef(getAccessToken);
  useEffect(() => {
    tokenReader.current = getAccessToken;
  }, [getAccessToken]);
  const request = useCallback(
    async (body: Record<string, unknown>, revision: number) => {
      const token = await tokenReader.current();
      if (revision !== generation.current) throw new Error("Workspace changed");
      if (!token) throw new Error("Please sign in again.");
      const response = await fetch("/api/context", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
        body: JSON.stringify({
          ...body,
          ...(organizationId ? { organization_id: organizationId } : {}),
        }),
        signal: AbortSignal.timeout(30000),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          "Unable to load or save this review. Reload the case to check current evidence and access.",
        );
      return result;
    },
    [organizationId],
  );
  const run = useCallback(
    async (work: (revision: number) => Promise<Partial<State>>) => {
      const revision = generation.current;
      setState((s) => ({ ...s, busy: true, error: "" }));
      try {
        const update = await work(revision);
        if (revision === generation.current)
          setState((s) => ({ ...s, ...update, busy: false }));
      } catch {
        if (revision === generation.current)
          setState((s) => ({
            ...empty(s.scope),
            error:
              "Unable to load or save this review. Reload the case to check current evidence and access.",
          }));
      }
    },
    [],
  );
  const reload = useCallback(
    () =>
      run(async (revision) => {
        const data = await request({ action: "list_release_cases" }, revision);
        return {
          items: data.cases,
          nextId: data.next_id ?? null,
          loaded: true,
        };
      }),
    [request, run],
  );
  useEffect(() => {
    const revision = ++generation.current;
    // Responses are hidden synchronously by scope; start the new fetch after commit.
    void Promise.resolve().then(() => {
      if (generation.current !== revision) return;
      setState(empty(scope));
      if (accountId) void reload();
    });
    return () => {
      generation.current = revision + 1;
    };
  }, [accountId, scope, reload]);
  const visible = state.scope === scope ? state : empty(scope);
  const open = (id: string) =>
    run(async (revision) => ({
      current: await request(
        { action: "read_release_case", request_id: id },
        revision,
      ),
    }));
  const more = () =>
    run(async (revision) => {
      const data = await request(
        { action: "list_release_cases", after_id: visible.nextId },
        revision,
      );
      return {
        items: [...visible.items, ...data.cases],
        nextId: data.next_id ?? null,
      };
    });
  const pendingReview = useRef<{ input: string; key: string } | null>(null);
  const review = (decision: "reviewed" | "needs_changes", note: string) =>
    run(async (revision) => {
      if (!visible.current) throw new Error("Select a release");
      const body = {
        action: "review_release_case",
        request_id: visible.current.request_id,
        fingerprint: visible.current.fingerprint,
        decision,
        note,
      };
      const input = JSON.stringify([scope, body]);
      if (pendingReview.current?.input !== input)
        pendingReview.current = { input, key: crypto.randomUUID() };
      await request(
        { ...body, idempotency_key: pendingReview.current.key },
        revision,
      );
      return {
        current: await request(
          {
            action: "read_release_case",
            request_id: visible.current.request_id,
          },
          revision,
        ),
      };
    });
  return { ...visible, reload, open, more, review };
}
