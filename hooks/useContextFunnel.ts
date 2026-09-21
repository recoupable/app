"use client";
import { useCallback, useEffect, useRef, useState } from "react";
type Snapshot = {
  id?: string;
  status: string;
  context?: {
    title?: string;
    artists?: { name: string }[];
    release?: { artwork?: { url: string }[] };
  };
  input?: { url: string };
  output?: unknown;
};
interface Options {
  accountId: string | null;
  getAccessToken: () => Promise<string | null>;
  login: () => void;
}
/** Personal-account funnel. Guest secrets remain in the HttpOnly cookie, never browser storage. */
export function useContextFunnel({
  accountId,
  getAccessToken,
  login,
}: Options) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [revision, retry] = useState(0);
  const attempted = useRef<string | null>(null);
  const generation = useRef(0);
  const request = useCallback(
    async (path: string, body?: unknown, auth = false) => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (auth) {
        const token = await getAccessToken();
        if (!token) throw new Error("Please sign in again.");
        headers.Authorization = `Bearer ${token}`;
      }
      const response = await fetch(path, {
        method: body ? "POST" : "GET",
        headers,
        credentials: "same-origin",
        cache: "no-store",
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(30000),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Unable to load context. Please retry.");
      return data;
    },
    [getAccessToken],
  );
  // Reset private state on account changes; only restore a request belonging to this account.
  useEffect(() => {
    generation.current++;
    setSnapshot(null);
    setError("");
    setBusy(false);
    setRequestId(
      accountId ? sessionStorage.getItem(`context:request:${accountId}`) : null,
    );
    attempted.current = null;
  }, [accountId]);
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    if (!requestId && !sessionStorage.getItem("context:guest")) return;
    if (sessionStorage.getItem("context:claim") && accountId && !requestId)
      return;
    async function poll() {
      try {
        const data = requestId
          ? await request(
              "/api/context",
              { action: "read", request_id: requestId },
              true,
            )
          : await request("/api/context/guest");
        if (cancelled) return;
        const value = requestId ? data.request : data;
        setSnapshot(value);
        setError("");
        if (["queued", "running"].includes(value.status))
          timer = setTimeout(poll, 2000);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      }
    }
    void poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [requestId, accountId, request, revision]);
  useEffect(() => {
    if (
      !accountId ||
      !sessionStorage.getItem("context:claim") ||
      attempted.current === accountId
    )
      return;
    attempted.current = accountId;
    const epoch = generation.current;
    setBusy(true);
    void request("/api/context/guest/claim", { action: "claim" }, true)
      .then((data) => {
        if (generation.current !== epoch) return;
        sessionStorage.setItem(`context:request:${accountId}`, data.requestId);
        sessionStorage.setItem(
          `context:claimed:${accountId}:${data.requestId}`,
          "1",
        );
        sessionStorage.removeItem("context:claim");
        sessionStorage.removeItem("context:guest");
        setRequestId(data.requestId);
        setSnapshot(null);
        retry((v) => v + 1);
        setError("");
      })
      .catch((e) => {
        if (generation.current === epoch) setError(e.message);
      })
      .finally(() => {
        if (generation.current === epoch) setBusy(false);
      });
  }, [accountId, request, revision]);
  const start = async (url: string) => {
    if (busy) return;
    setBusy(true);
    setError("");
    const epoch = generation.current;
    sessionStorage.setItem(`context:last-url:${accountId ?? "guest"}`, url);
    try {
      let data;
      if (accountId) {
        // Keep the same key on transport failure so retry cannot create another job.
        const keyName = `context:submission:${accountId}:${url}`;
        const key = sessionStorage.getItem(keyName) || crypto.randomUUID();
        sessionStorage.setItem(keyName, key);
        data = await request(
          "/api/context",
          {
            action: "ingest",
            url,
            idempotency_key: key,
            topics: ["release_metadata", "artist_metadata"],
          },
          true,
        );
        if (generation.current !== epoch) return;
        sessionStorage.setItem(`context:request:${accountId}`, data.request.id);
        setRequestId(data.request.id);
        setSnapshot(data.request);
      } else {
        sessionStorage.setItem("context:guest", "1");
        data = await request("/api/context/guest", { action: "start", url });
        if (generation.current !== epoch) return;
        setSnapshot(data);
      }
      retry((v) => v + 1);
    } catch (e) {
      if (generation.current === epoch) setError((e as Error).message);
    } finally {
      if (generation.current === epoch) setBusy(false);
    }
  };
  const save = () => {
    sessionStorage.setItem("context:claim", "1");
    attempted.current = null;
    setError("");
    if (!accountId) login();
    retry((v) => v + 1);
  };
  const refresh = () => {
    if (
      accountId &&
      requestId &&
      sessionStorage.getItem(`context:claimed:${accountId}:${requestId}`) &&
      snapshot?.status === "failed"
    ) {
      save();
      return;
    }
    attempted.current = null;
    setError("");
    const lastUrl =
      snapshot?.input?.url ||
      sessionStorage.getItem(`context:last-url:${accountId ?? "guest"}`);
    if (
      lastUrl &&
      !sessionStorage.getItem("context:claim") &&
      (!snapshot || snapshot.status === "failed")
    ) {
      void start(lastUrl);
    } else retry((v) => v + 1);
  };
  return { snapshot, requestId, busy, error, start, save, refresh };
}
