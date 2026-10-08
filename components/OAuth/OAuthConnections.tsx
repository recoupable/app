"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Bot, RefreshCw } from "lucide-react";
import LogoIcon from "@/components/Logo/LogoIcon";
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
      className="mx-auto w-full max-w-2xl px-5 pb-12 pt-5 sm:pt-8"
      aria-labelledby="connections-title"
    >
      <div className="overflow-hidden rounded-[28px] bg-card shadow-[0_0_0_1px_var(--border),0_12px_40px_var(--surface-shadow)]">
        <div className="relative overflow-hidden bg-[var(--brand-on-lime)] px-7 py-8 text-[var(--sky-text)] sm:px-9 sm:py-9">
          <LogoIcon
            className="pointer-events-none absolute -right-10 -top-8 h-72 w-64 rotate-12 opacity-[0.06]"
            aria-hidden="true"
          />
          <div className="relative">
            <h1
              id="connections-title"
              className="max-w-sm font-heading text-4xl font-medium leading-[1.05] tracking-[-0.045em] sm:text-5xl"
            >
              Connected{" "}
              <span className="text-[var(--brand-lime)]">agents.</span>
            </h1>
            {authenticated && (
              <div className="mt-5 flex items-center justify-between gap-3">
                <p className="min-w-0 break-all text-sm text-[var(--sky-text)]/75">
                  {user?.email?.address ?? "Signed in to Recoup"}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-11 shrink-0 rounded-full text-[var(--sky-text)]/75 hover:bg-[var(--sky-text)]/10 hover:text-[var(--sky-text)]"
                  disabled={!!busy}
                  aria-label="Refresh connections"
                  title="Refresh connections"
                  onClick={() => setRevision((value) => value + 1)}
                >
                  <RefreshCw className="size-4" aria-hidden="true" />
                </Button>
              </div>
            )}
          </div>
        </div>
        {!ready ? (
          <p role="status" className="p-7 text-sm text-muted-foreground">
            Loading sign-in…
          </p>
        ) : !authenticated ? (
          <Button onClick={() => login()} className="m-7 h-11">
            Sign in to Recoup
          </Button>
        ) : (
          <div>
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
                className="px-7 py-7 shadow-[0_-1px_0_var(--border)] sm:px-9"
              >
                <div className="flex items-start gap-3">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-secondary text-foreground shadow-[inset_0_0_0_1px_var(--border)]">
                    <Bot className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="break-words text-lg font-semibold tracking-tight">
                      {connection.clientName}
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {connection.expiresAt === null
                        ? "Until you disconnect"
                        : `Expires ${new Date(
                            connection.expiresAt * 1000,
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}`}
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    {connection.scopes.includes("mcp:read") && (
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1 text-xs font-medium">
                        Read access
                      </span>
                    )}
                    {connection.scopes.includes("mcp:write") && (
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1 text-xs font-medium">
                        Write access
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    className="h-10 rounded-full px-4 text-muted-foreground shadow-[0_0_0_1px_var(--border)] hover:bg-destructive/10 hover:text-destructive"
                    disabled={!!busy}
                    aria-label={`Disconnect ${connection.clientName}`}
                    onClick={() => void revoke(connection.id)}
                  >
                    {busy === connection.id ? "Disconnecting…" : "Disconnect"}
                  </Button>
                </div>
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
          <p role="alert" className="px-7 pb-5 text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
