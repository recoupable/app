import { useCallback, useEffect, useRef } from "react";
import type { ReleaseCaseResponses } from "@/lib/releases/responseTypes";
import {
  RELEASE_CASE_ERROR,
  ReleaseCaseRequestError,
} from "@/lib/releases/errors";
export function useReleaseCaseRequest(
  organizationId: string | null,
  getAccessToken: () => Promise<string | null>,
  getGeneration: () => number,
) {
  const tokenReader = useRef(getAccessToken);
  useEffect(() => {
    tokenReader.current = getAccessToken;
  }, [getAccessToken]);
  const request = useCallback(
    async <Action extends keyof ReleaseCaseResponses>(
      body: Record<string, unknown> & { action: Action },
      revision: number,
    ): Promise<ReleaseCaseResponses[Action]> => {
      const token = await tokenReader.current();
      if (revision !== getGeneration()) throw new Error("Workspace changed");
      if (!token) throw new ReleaseCaseRequestError("Please sign in again.");
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
      if (response.status === 401)
        throw new ReleaseCaseRequestError("Please sign in again.");
      if (!response.ok) throw new Error(RELEASE_CASE_ERROR);
      const result: unknown = await response.json();
      return result as ReleaseCaseResponses[Action];
    },
    [organizationId, getGeneration],
  );
  return request;
}
