"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { empty, type ReleaseCaseState as State } from "@/lib/releases/state";
import {
  RELEASE_CASE_ERROR,
  ReleaseCaseRequestError,
} from "@/lib/releases/errors";
import { useReleaseCaseRequest } from "./useReleaseCaseRequest";
import { useReleaseCaseReview } from "./useReleaseCaseReview";
interface Options {
  accountId: string | null;
  organizationId: string | null;
  getAccessToken: () => Promise<string | null>;
}
/** Keep private responses and in-flight writes bound to the selected account/workspace. */
export function useReleaseCases({
  accountId,
  organizationId,
  getAccessToken,
}: Options) {
  const scope = JSON.stringify([accountId, organizationId]);
  const [state, setState] = useState<State>(() => empty(scope));
  const generation = useRef(0);
  const getGeneration = useCallback(() => generation.current, []);
  const request = useReleaseCaseRequest(
    organizationId,
    getAccessToken,
    getGeneration,
  );
  const run = useCallback(
    async (work: (revision: number) => Promise<Partial<State>>) => {
      const revision = generation.current;
      setState((s) => ({ ...s, busy: true, error: "" }));
      try {
        const update = await work(revision);
        if (revision === generation.current)
          setState((s) => ({ ...s, ...update, busy: false }));
      } catch (error) {
        if (revision === generation.current)
          setState((s) => ({
            ...empty(s.scope),
            error:
              error instanceof ReleaseCaseRequestError
                ? error.message
                : RELEASE_CASE_ERROR,
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
  const review = useReleaseCaseReview(visible.current, scope, request, run);
  return { ...visible, reload, open, more, review };
}
