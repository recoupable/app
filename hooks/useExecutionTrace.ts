"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ExecutionSummary,
  ExecutionTrace,
} from "@/lib/releases/executionTypes";
import { ReleaseCaseRequestError } from "@/lib/releases/errors";
import { useReleaseCaseRequest } from "./useReleaseCaseRequest";
const TRACE_UNAVAILABLE =
  "Execution traces unavailable. Check your workspace and that this request is saved.";
/**
 * Read-only trace access for one request. It only lists and opens saved
 * executions; it never retries, dispatches or reconciles work. Mount it with a
 * key that includes the workspace so a workspace change discards loaded traces.
 */
export function useExecutionTrace(
  requestId: string,
  organizationId: string | null,
  getAccessToken: () => Promise<string | null>,
) {
  const [executions, setExecutions] = useState<ExecutionSummary[] | null>(null);
  const [trace, setTrace] = useState<ExecutionTrace | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const generation = useRef(0);
  const getGeneration = useCallback(() => generation.current, []);
  const request = useReleaseCaseRequest(
    organizationId,
    getAccessToken,
    getGeneration,
  );
  useEffect(
    () => () => {
      generation.current++;
    },
    [],
  );
  const perform = async (work: (revision: number) => Promise<void>) => {
    const revision = generation.current;
    setBusy(true);
    setNotice("");
    try {
      await work(revision);
    } catch (error) {
      if (revision === generation.current) {
        setTrace(null);
        setNotice(
          error instanceof ReleaseCaseRequestError
            ? error.message
            : TRACE_UNAVAILABLE,
        );
      }
    } finally {
      if (revision === generation.current) setBusy(false);
    }
  };
  const list = () =>
    perform(async (revision) => {
      const result = await request(
        { action: "list_executions", request_id: requestId },
        revision,
      );
      if (revision !== generation.current) return;
      setTrace(null);
      setExecutions(result.executions);
    });
  const open = (executionId: string) =>
    perform(async (revision) => {
      const result = await request(
        { action: "read_execution", execution_id: executionId },
        revision,
      );
      if (revision !== generation.current) return;
      setTrace(result.execution);
    });
  return { executions, trace, busy, notice, list, open };
}
