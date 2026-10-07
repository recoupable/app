"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Bot, Check, ChevronDown, Link2, ShieldCheck } from "lucide-react";
import LogoIcon from "@/components/Logo/LogoIcon";
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
      className="mx-auto w-full max-w-lg px-5 pb-12 pt-8 sm:pt-14"
    >
      <div className="space-y-6 rounded-2xl bg-card p-6 shadow-[0_0_0_1px_var(--border),0_8px_32px_var(--surface-shadow)] sm:p-8">
        <div className="text-center">
          <div
            className="mb-6 flex items-center justify-center gap-4"
            aria-hidden="true"
          >
            <span className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <LogoIcon className="size-7" />
            </span>
            <Link2 className="size-5 text-muted-foreground" />
            <span className="flex size-14 items-center justify-center rounded-2xl bg-secondary">
              <Bot className="size-7" />
            </span>
          </div>
          <h1
            id="consent-title"
            className="font-heading text-2xl font-semibold tracking-tight"
          >
            Connect to Recoup
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Review access to your personal account.
          </p>
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
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-secondary/60 px-3 py-2 text-sm">
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
                  <p className="text-xs leading-5 text-muted-foreground">
                    This app hasn’t been verified by Recoup. Only continue if
                    you started this connection.
                  </p>
                  <details className="group text-xs text-muted-foreground">
                    <summary className="flex min-h-11 w-fit cursor-pointer list-none items-center gap-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                      Client details
                      <ChevronDown
                        className="size-3 group-open:rotate-180"
                        aria-hidden="true"
                      />
                    </summary>
                    <p className="break-all rounded-lg bg-secondary p-3">
                      Client ID: {metadata.clientId}
                    </p>
                  </details>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-medium">
                    On your personal Recoup account, this agent can:
                  </p>
                  <ul className="space-y-3 text-sm">
                    {metadata.permissions.map((permission) => (
                      <li
                        key={permission.scope}
                        className="flex items-start gap-3 leading-6"
                      >
                        <Check
                          className="mt-1 size-4 shrink-0 text-foreground"
                          aria-hidden="true"
                        />
                        <span>{permission.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="flex items-start gap-2 rounded-xl bg-secondary/60 p-3 text-xs leading-5 text-muted-foreground">
                  <ShieldCheck
                    className="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>
                    Access continues when you leave this page and expires after{" "}
                    {metadata.accessDurationDays} days. Your organization
                    workspaces are not included. You can revoke access from
                    Connected agents in Recoup.
                  </span>
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    disabled={busy}
                    onClick={() => void decide("deny")}
                    className="h-11 flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={busy}
                    onClick={() => void decide("approve")}
                    className="h-11 flex-1"
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
