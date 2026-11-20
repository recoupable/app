import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { usePrivy } from "@privy-io/react-auth";
import { Check, ChevronDown } from "lucide-react";
import type { WorkspaceSelection } from "@/lib/oauth/selectedContextSchema";
import LogoIcon from "@/components/Logo/LogoIcon";
import { Button } from "@/components/ui/button";
import {
  createConsentClient,
  type ConsentMetadata,
} from "@/lib/oauth/createConsentClient";

export default function OAuthConsentSession({
  issuer,
  interaction,
  auth,
}: {
  issuer: string;
  interaction: string;
  auth: ReturnType<typeof usePrivy>;
}) {
  const { ready, authenticated, user, login, logout, getAccessToken } = auth;
  const client = useMemo(
    () => createConsentClient(issuer, interaction),
    [issuer, interaction],
  );
  const [selectedMode, setSelectedMode] = useState(false);
  const [selection, setSelection] = useState<WorkspaceSelection>();
  const selectionKey = JSON.stringify([selectedMode, selection]);
  const [loaded, setLoaded] = useState<{
    userId: string;
    issuer: string;
    interaction: string;
    metadata: ConsentMetadata;
    selectionKey: string;
  }>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const active = useRef(true);
  useLayoutEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  const userId = user?.id;
  const sessionMetadata =
    loaded?.userId === userId &&
    loaded?.issuer === issuer &&
    loaded?.interaction === interaction
      ? loaded.metadata
      : undefined;
  // Keep workspace choices mounted, but never retain an earlier approval ticket.
  const metadata =
    loaded?.selectionKey === selectionKey
      ? sessionMetadata
      : selectedMode && sessionMetadata && "consent_version" in sessionMetadata
        ? { ...sessionMetadata, csrf: undefined, selectedContext: undefined }
        : undefined;

  useEffect(() => {
    if (!ready || !authenticated || !userId) return;
    const abort = new AbortController();
    void (async () => {
      try {
        setError("");
        const token = await getAccessToken();
        if (!token) throw new Error("Sign in again to connect your account.");
        const result = selectedMode
          ? await client.loadSelected(token, selection, abort.signal)
          : await client.load(token, abort.signal);
        if (!abort.signal.aborted)
          setLoaded({
            userId,
            issuer,
            interaction,
            metadata: result,
            selectionKey,
          });
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
    selectedMode,
    selection,
    selectionKey,
  ]);

  const decide = async (decision: "approve" | "deny") => {
    if (!metadata?.csrf || submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Sign in again to connect your account.");
      // Neither submission nor navigation may outlive the consent session.
      if (!active.current) return;
      const redirectUrl = selectedMode
        ? await client.decide(token, metadata.csrf, decision, selection)
        : await client.decide(token, metadata.csrf, decision);
      if (active.current) window.location.assign(redirectUrl);
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
                  {"consent_version" in metadata ? (
                    <div className="space-y-2">
                      <label
                        htmlFor="oauth-workspace"
                        className="text-sm font-medium"
                      >
                        Workspace for Context tools
                      </label>
                      <select
                        id="oauth-workspace"
                        disabled={busy}
                        className="min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring"
                        value={
                          selection?.workspace_kind === "organization"
                            ? selection.organization_id
                            : (selection?.workspace_kind ?? "")
                        }
                        onChange={(event) => {
                          setLoaded((previous) =>
                            previous && "consent_version" in previous.metadata
                              ? {
                                  ...previous,
                                  metadata: {
                                    ...previous.metadata,
                                    csrf: undefined,
                                    selectedContext: undefined,
                                  },
                                }
                              : undefined,
                          );
                          setSelection(
                            event.target.value === "personal"
                              ? { workspace_kind: "personal" }
                              : {
                                  workspace_kind: "organization",
                                  organization_id: event.target.value,
                                },
                          );
                        }}
                      >
                        <option value="" disabled>
                          Choose a workspace
                        </option>
                        {metadata.workspaces.map((workspace) => (
                          <option
                            key={workspace.organizationId ?? "personal"}
                            value={workspace.organizationId ?? "personal"}
                          >
                            {workspace.name}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs leading-5 text-muted-foreground">
                        Read and save Context briefs, ingest research, review
                        releases, and plan or run Context jobs in this
                        workspace. Jobs can use external research services.
                        Other Recoup tools are excluded.
                      </p>
                      <Button
                        variant="ghost"
                        disabled={busy}
                        onClick={() => {
                          setLoaded(undefined);
                          setSelection(undefined);
                          setSelectedMode(false);
                        }}
                      >
                        Back to requested permissions
                      </Button>
                    </div>
                  ) : metadata.permissions.some(
                      (permission) => permission.scope === "mcp:tools",
                    ) ? (
                    <Button
                      variant="outline"
                      disabled={busy}
                      className="h-auto min-h-11 w-full whitespace-normal"
                      onClick={() => {
                        setLoaded(undefined);
                        setSelectedMode(true);
                      }}
                    >
                      Choose one workspace for Context tools
                    </Button>
                  ) : null}
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
                      {selectedMode
                        ? "Selected workspace"
                        : metadata.permissions.some(
                              (permission) => permission.scope === "mcp:tools",
                            )
                          ? "Accessible workspaces"
                          : "Personal account"}{" "}
                      ·{" "}
                      {metadata.accessDurationDays === null
                        ? "Until you disconnect"
                        : `${metadata.accessDurationDays} days · Revoke anytime`}
                    </p>
                    <p>
                      {selectedMode
                        ? "This connection stays limited to your chosen workspace. Changing its workspace or adding tools requires a new approval."
                        : metadata.permissions.some(
                              (permission) => permission.scope === "mcp:tools",
                            )
                          ? "Includes personal and organization workspaces your account can access. Private conversations and tasks stay account-bound."
                          : "Your organization workspaces are not included."}{" "}
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
                          Access continues when you leave this page. Revoke
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
                      disabled={busy || !metadata.csrf}
                      onClick={() => void decide("deny")}
                      className="h-11 min-w-20 flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      disabled={busy || !metadata.csrf}
                      onClick={() => void decide("approve")}
                      className="h-11 min-w-32 flex-[2] rounded-xl"
                    >
                      {busy ? "Connecting…" : "Allow access"}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {!error && (
                    <p role="status">Loading requested permissions…</p>
                  )}
                  {selectedMode && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setLoaded(undefined);
                        setSelection(undefined);
                        setSelectedMode(false);
                      }}
                    >
                      Back to requested permissions
                    </Button>
                  )}
                </>
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
