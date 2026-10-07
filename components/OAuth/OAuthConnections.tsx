"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  Unplug,
  Bot,
  ChevronDown,
  RefreshCw,
  ShieldCheck,
  UserRound,
} from "lucide-react";
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
      className="mx-auto w-full max-w-2xl px-5 pb-12 pt-10 sm:pt-16"
      aria-labelledby="connections-title"
    >
      <div className="mb-8">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Your account
        </p>
        <h1
          id="connections-title"
          className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl"
        >
          Connected agents
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Manage which agents can access your Recoup account.
        </p>
      </div>
      {!ready ? (
        <p role="status" className="text-sm text-muted-foreground">
          Loading sign-in…
        </p>
      ) : !authenticated ? (
        <Button onClick={() => login()} className="h-11">
          Sign in to Recoup
        </Button>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-card shadow-[0_0_0_1px_var(--border),0_8px_32px_var(--surface-shadow)]">
          <div className="flex items-center gap-3 px-5 py-4 sm:px-6">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary">
              <UserRound className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Personal account</p>
              <p className="break-all text-sm font-medium">
                {user?.email?.address ?? "Signed in to Recoup"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-11 shrink-0"
              disabled={!!busy}
              aria-label="Refresh connections"
              title="Refresh connections"
              onClick={() => setRevision((value) => value + 1)}
            >
              <RefreshCw className="size-4" aria-hidden="true" />
            </Button>
          </div>
          {!data && !error && (
            <p
              role="status"
              className="px-6 py-10 text-sm text-muted-foreground"
            >
              Loading connections…
            </p>
          )}
          {data?.connections.length === 0 && (
            <div className="px-6 py-12 text-center shadow-[0_-1px_0_var(--border)]">
              <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-secondary">
                <Bot className="size-6" aria-hidden="true" />
              </span>
              <h2 className="font-medium">No connected agents.</h2>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
                Connect Recoup from your agent’s settings. It will appear here
                once you allow access.
              </p>
            </div>
          )}
          {data?.connections.map((connection) => (
            <article
              key={connection.id}
              className="px-5 py-6 shadow-[0_-1px_0_var(--border)] sm:px-6"
            >
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Bot className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="break-words text-base font-semibold tracking-tight">
                    {connection.clientName}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Expires{" "}
                    {new Date(connection.expiresAt * 1000).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" },
                    )}
                  </p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {connection.scopes.includes("mcp:read") && (
                    <span className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium">
                      Read access
                    </span>
                  )}
                  {connection.scopes.includes("mcp:write") && (
                    <span className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium">
                      Write access
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  className="h-11 px-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  disabled={!!busy}
                  aria-label={`Revoke ${connection.clientName}`}
                  onClick={() => void revoke(connection.id)}
                >
                  {busy === connection.id ? "Disconnecting…" : "Disconnect"}
                  <Unplug className="size-3.5" aria-hidden="true" />
                </Button>
              </div>
              <details className="group mt-3 text-xs text-muted-foreground">
                <summary className="flex min-h-11 w-fit cursor-pointer list-none items-center gap-1.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                  Connection details
                  <ChevronDown
                    className="size-3 transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <p className="break-all rounded-lg bg-secondary p-3 leading-5">
                  Client ID: {connection.clientId}
                  <br />
                  Permissions: {connection.scopes.join(", ")}
                </p>
              </details>
            </article>
          ))}
          {data?.truncated && (
            <p className="px-6 pb-5 text-sm text-muted-foreground">
              Showing the first 200 connections. Revoke unused connections and
              refresh to see more.
            </p>
          )}
        </div>
      )}
      {error && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      )}
      <p className="mt-6 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        Disconnecting stops future access. Changes already made stay in Recoup.
      </p>
    </section>
  );
}
