"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  createConnectionsClient,
  type Connections,
} from "@/lib/oauth/createConnectionsClient";

export default function OAuthConnections({ issuer }: { issuer: string }) {
  const { ready, authenticated, user, login, getAccessToken } = usePrivy();
  const client = useMemo(() => createConnectionsClient(issuer), [issuer]);
  const [loaded, setLoaded] = useState<{
    owner: string;
    issuer: string;
    data: Connections;
  }>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string>();
  const [revision, setRevision] = useState(0);
  const pending = useRef(false);
  const loadGeneration = useRef(0);
  const owner = user?.id;
  const data =
    authenticated && loaded?.owner === owner && loaded?.issuer === issuer
      ? loaded.data
      : undefined;
  useEffect(() => {
    if (!ready || !authenticated || !owner) return;
    const abort = new AbortController();
    const generation = ++loadGeneration.current;
    void (async () => {
      try {
        setError("");
        const token = await getAccessToken();
        if (!token) throw new Error("Sign in again to manage connections.");
        const result = await client.load(token, abort.signal);
        if (!abort.signal.aborted && generation === loadGeneration.current)
          setLoaded({ owner, issuer, data: result });
      } catch (cause) {
        if (!abort.signal.aborted && generation === loadGeneration.current)
          setError(
            cause instanceof Error
              ? cause.message
              : "Unable to load connections.",
          );
      }
    })();
    return () => abort.abort();
  }, [ready, authenticated, owner, issuer, client, getAccessToken, revision]);
  const revoke = async (id: string) => {
    if (pending.current || !data) return;
    pending.current = true;
    setBusy(id);
    setError("");
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Sign in again to manage connections.");
      await client.revoke(token, id);
      loadGeneration.current += 1;
      setLoaded((current) =>
        current && current.owner === owner && current.issuer === issuer
          ? {
              ...current,
              data: {
                ...current.data,
                connections: current.data.connections.filter(
                  (item) => item.id !== id,
                ),
              },
            }
          : current,
      );
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to revoke connection.",
      );
    } finally {
      pending.current = false;
      setBusy(undefined);
    }
  };
  return (
    <section
      className="mx-auto my-10 w-full max-w-xl space-y-6 px-5"
      aria-labelledby="connections-title"
    >
      <div className="space-y-2">
        <h1 id="connections-title" className="text-2xl font-semibold">
          Connected agents
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage agents connected to your personal Recoup account. Revoking
          access blocks future requests and refreshes. It does not undo
          completed changes.
        </p>
      </div>
      {!ready ? (
        <p role="status">Loading sign-in…</p>
      ) : !authenticated ? (
        <Button onClick={() => login()}>Sign in to Recoup</Button>
      ) : (
        <>
          <p className="break-all text-sm">
            {user?.email?.address ?? "Signed in to Recoup"}
          </p>
          {!data && !error && <p role="status">Loading connections…</p>}
          {data?.connections.length === 0 && <p>No connected agents.</p>}
          {data?.connections.map((connection) => (
            <article
              key={connection.id}
              className="space-y-3 rounded-2xl bg-card p-5 shadow-[0_0_0_1px_var(--border)]"
            >
              <h2 className="break-words font-medium">
                {connection.clientName}
              </h2>
              <p className="break-all text-xs text-muted-foreground">
                Client: {connection.clientId}
              </p>
              <p className="text-sm">
                Permissions: {connection.scopes.join(", ")}
              </p>
              <p className="text-sm text-muted-foreground">
                Expires{" "}
                {new Date(connection.expiresAt * 1000).toLocaleDateString()}
              </p>
              <Button
                variant="secondary"
                disabled={!!busy}
                aria-label={`Revoke ${connection.clientName}`}
                onClick={() => void revoke(connection.id)}
              >
                {busy === connection.id ? "Revoking…" : "Revoke access"}
              </Button>
            </article>
          ))}
          {data?.truncated && (
            <p className="text-sm">
              Showing the first 200 connections. Revoke unused connections and
              refresh to see more.
            </p>
          )}
          <Button
            variant="ghost"
            disabled={!!busy}
            onClick={() => setRevision((value) => value + 1)}
          >
            Refresh connections
          </Button>
        </>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Link href="/" className="block text-sm underline">
        Back to Recoup
      </Link>
    </section>
  );
}
