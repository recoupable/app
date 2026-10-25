import {
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useUserProvider } from "@/providers/UserProvder";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

/** Templates belong to the authenticated actor, never the selected roster account. */
export function useAgentTemplateScope() {
  const { authenticated, user, getAccessToken } = usePrivy();
  const { userData } = useUserProvider();
  const actor = authenticated ? (user?.id ?? "") : "";
  const accountId = actor ? userData?.account_id : undefined;
  const apiBaseUrl = getClientApiBaseUrl();
  const readerId = useId();
  const identity = JSON.stringify([actor, accountId, apiBaseUrl]);
  const [session, setSession] = useState({ identity, generation: 0 });
  if (session.identity !== identity)
    setSession({ identity, generation: session.generation + 1 });
  const scopeKey = JSON.stringify([readerId, session.generation, identity]);
  const ready = Boolean(actor && accountId);
  const context = useMemo(() => ({ scopeKey, ready }), [scopeKey, ready]);
  const current = useRef<typeof context | null>(context);
  const controllers = useRef(new Set<AbortController>());
  useLayoutEffect(() => {
    current.current = context;
    const pending = controllers.current;
    return () => {
      current.current = null;
      pending.forEach((controller) => controller.abort());
      pending.clear();
    };
  }, [context]);
  const isCurrent = useCallback(
    () =>
      ready &&
      current.current === context &&
      getClientApiBaseUrl() === apiBaseUrl,
    [ready, context, apiBaseUrl],
  );
  const request = useCallback(
    async <T>(
      send: (token: string, signal: AbortSignal) => Promise<T>,
      signal?: AbortSignal,
    ) => {
      const controller = new AbortController();
      controllers.current.add(controller);
      const abort = () => controller.abort();
      if (signal?.aborted) controller.abort();
      signal?.addEventListener("abort", abort, { once: true });
      const assertCurrent = () => {
        if (!isCurrent() || controller.signal.aborted)
          throw new Error("Your session changed. Reload agents.");
      };
      try {
        assertCurrent();
        const token = await getAccessToken();
        assertCurrent();
        if (!token) throw new Error("Please sign in to manage agents.");
        const result = await send(token, controller.signal);
        assertCurrent();
        return result;
      } finally {
        signal?.removeEventListener("abort", abort);
        controllers.current.delete(controller);
      }
    },
    [getAccessToken, isCurrent],
  );
  return {
    accountId,
    apiBaseUrl,
    scopeKey,
    ready,
    isCurrent,
    request,
    cachePrefix: ["agent-templates", identity],
  };
}
