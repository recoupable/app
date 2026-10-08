"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Check, ChevronDown } from "lucide-react";
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
      className="mx-auto w-full max-w-md px-5 pb-10 pt-6 sm:pt-10"
    >
      <div className="overflow-hidden rounded-3xl bg-card shadow-[0_0_0_1px_var(--border),0_12px_40px_var(--surface-shadow)]">
        <header className="bg-brand-on-lime px-6 py-6 text-white sm:px-7">
          <LogoIcon
            className="mb-5 size-7 text-brand-lime"
            aria-hidden="true"
          />
          <h1
            id="consent-title"
            className="break-words font-heading text-3xl font-medium leading-tight tracking-tight"
          >
            {metadata ? (
              <>
                Connect{" "}
                <span className="text-brand-lime">{metadata.clientName}</span>
                <br />
                to Recoup.
              </>
            ) : (
              <>
                Connect to <span className="text-brand-lime">Recoup.</span>
              </>
            )}
          </h1>
          {authenticated && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-x-2 text-xs text-white/75">
              <span className="break-all">
                {user?.email?.address ?? "Signed in to Recoup"}
              </span>
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  setLoaded(undefined);
                  setError("");
                  await logout();
                }}
                className="min-h-11 shrink-0 rounded-md px-1 underline decoration-white/30 underline-offset-4 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime disabled:opacity-50"
              >
                Switch
              </button>
            </div>
          )}
        </header>
        <div className="space-y-5 p-6 sm:p-7">
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
              {metadata ? (
                <>
                  <div className="space-y-3">
                    <h2 className="sr-only">Requested permissions</h2>
                    <ul className="space-y-3 text-sm">
                      {metadata.permissions.map((permission) => (
                        <li
                          key={permission.scope}
                          className="flex items-start gap-3 leading-5"
                        >
                          <Check
                            className="mt-1 size-4 shrink-0 text-foreground"
                            aria-hidden="true"
                          />
                          <span>
                            {permission.scope === "mcp:read"
                              ? "View artists, social profiles, and chat list"
                              : permission.scope === "mcp:write"
                                ? "Create and edit artist profiles"
                                : permission.description}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3 text-xs leading-5 text-muted-foreground">
                    <p>
                      Personal account ·{" "}
                      {metadata.accessDurationDays === null
                        ? "Until you disconnect"
                        : `${metadata.accessDurationDays} days · Revoke anytime`}
                    </p>
                    <details className="group">
                      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                        <span>Unverified app</span>
                        <ChevronDown
                          className="size-3 shrink-0 motion-safe:transition-transform group-open:rotate-180"
                          aria-hidden="true"
                        />
                      </summary>
                      <div className="space-y-2 rounded-lg bg-secondary p-3">
                        <p>
                          The app name is supplied by its developer, not
                          verified by Recoup. Only continue if you recognize
                          this app and started this connection.
                        </p>
                        <p>
                          Access continues when you leave this page. Your
                          organization workspaces are not included. Revoke
                          access in Connected agents.
                        </p>
                        <p className="break-all">
                          Client ID: {metadata.clientId}
                        </p>
                      </div>
                    </details>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="ghost"
                      disabled={busy}
                      onClick={() => void decide("deny")}
                      className="h-11 min-w-20 flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      disabled={busy}
                      onClick={() => void decide("approve")}
                      className="h-11 min-w-32 flex-[2] rounded-xl"
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
      </div>
    </section>
  );
}
