"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import {
  createConsentClient,
  type ConsentMetadata,
} from "@/lib/oauth/createConsentClient";

export default function OAuthConsent({
  issuer,
  interaction,
}: {
  issuer: string;
  interaction: string;
}) {
  const { ready, authenticated, user, login, logout, getAccessToken } =
    usePrivy();
  const client = useMemo(
    () => createConsentClient(issuer, interaction),
    [issuer, interaction],
  );
  const [loaded, setLoaded] = useState<{
    userId: string;
    issuer: string;
    interaction: string;
    metadata: ConsentMetadata;
  }>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const userId = user?.id;
  const metadata =
    loaded?.userId === userId &&
    loaded?.issuer === issuer &&
    loaded?.interaction === interaction
      ? loaded.metadata
      : undefined;

  useEffect(() => {
    if (!ready || !authenticated || !userId) return;
    const abort = new AbortController();
    void (async () => {
      try {
        setError("");
        const token = await getAccessToken();
        if (!token) throw new Error("Sign in again to connect your account.");
        const result = await client.load(token, abort.signal);
        if (!abort.signal.aborted)
          setLoaded({ userId, issuer, interaction, metadata: result });
      } catch (cause) {
        if (!abort.signal.aborted)
          setError(
            cause instanceof Error
              ? cause.message
              : "Unable to load connection request.",
          );
      }
    })();
    return () => abort.abort();
  }, [
    ready,
    authenticated,
    userId,
    getAccessToken,
    client,
    issuer,
    interaction,
  ]);

  const decide = async (decision: "approve" | "deny") => {
    if (!metadata || submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Sign in again to connect your account.");
      window.location.assign(
        await client.decide(token, metadata.csrf, decision),
      );
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to finish connection.",
      );
      // Approval is one-use; a failed response requires a new connection request.
      setLoaded(undefined);
      setBusy(false);
      submitting.current = false;
    }
  };

  return (
    <section
      aria-labelledby="consent-title"
      className="mx-auto my-10 w-full max-w-lg px-5"
    >
      <div className="space-y-6 rounded-2xl bg-card p-7 shadow-[0_0_0_1px_var(--border),0_4px_16px_rgba(0,0,0,0.04)]">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Connect an agent
          </p>
          <h1
            id="consent-title"
            className="text-2xl font-semibold tracking-tight"
          >
            Connect to Recoup
          </h1>
        </div>
        {!ready ? (
          <p role="status">Loading sign-in…</p>
        ) : !authenticated ? (
          <>
            <p className="text-sm text-muted-foreground">
              Sign in to your existing Recoup account to review this agent’s
              permissions.
            </p>
            <Button onClick={() => login()} className="w-full">
              Sign in to Recoup
            </Button>
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="break-all">
                {user?.email?.address ?? "Signed in to Recoup"}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={busy}
                onClick={async () => {
                  setLoaded(undefined);
                  setError("");
                  await logout();
                }}
              >
                Switch account
              </Button>
            </div>
            {metadata ? (
              <>
                <div className="space-y-2">
                  <h2 className="break-words text-lg font-medium">
                    {metadata.clientName} wants access
                  </h2>
                  <p className="break-all text-xs text-muted-foreground">
                    Client: {metadata.clientId}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    This app’s name is supplied by its developer and has not
                    been verified by Recoup. Continue only if you recognize the
                    connection you started.
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-medium">
                    On your personal Recoup account, this agent can:
                  </p>
                  <ul className="list-disc space-y-2 pl-5 text-sm">
                    {metadata.permissions.map((permission) => (
                      <li key={permission.scope}>{permission.description}</li>
                    ))}
                  </ul>
                </div>
                <p className="text-sm text-muted-foreground">
                  Access continues when you leave this page and expires after{" "}
                  {metadata.accessDurationDays} days. Your organization
                  workspaces are not included.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    disabled={busy}
                    onClick={() => void decide("deny")}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={busy}
                    onClick={() => void decide("approve")}
                    className="flex-1"
                  >
                    {busy ? "Connecting…" : "Allow access"}
                  </Button>
                </div>
              </>
            ) : (
              !error && <p role="status">Loading requested permissions…</p>
            )}
          </>
        )}
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
