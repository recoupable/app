import { useCallback, useEffect, useRef } from "react";
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
    async (body: Record<string, unknown>, revision: number) => {
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
      const result = await response.json();
      if (response.status === 401)
        throw new ReleaseCaseRequestError("Please sign in again.");
      if (!response.ok) throw new Error(RELEASE_CASE_ERROR);
      return result;
    },
    [organizationId, getGeneration],
  );
  return request;
}
