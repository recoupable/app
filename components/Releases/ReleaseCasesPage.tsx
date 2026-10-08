"use client";
import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useUserProvider } from "@/providers/UserProvder";
import { useOrganization } from "@/providers/OrganizationProvider";
import { useReleaseCases } from "@/hooks/useReleaseCases";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
export default function ReleaseCasesPage() {
  const { ready, authenticated, getAccessToken, login } = usePrivy();
  const { userData } = useUserProvider();
  const { selectedOrgId, isInitialized } = useOrganization();
  const accountId =
    authenticated && isInitialized ? (userData?.account_id ?? null) : null;
  const cases = useReleaseCases({
    accountId,
    organizationId: selectedOrgId,
    getAccessToken,
  });
  const [notes, setNotes] = useState({ scope: "", text: "" });
  const current = cases.current;
  const noteScope = JSON.stringify([
    accountId,
    selectedOrgId,
    current?.request_id,
    current?.fingerprint,
  ]);
  const note = notes.scope === noteScope ? notes.text : "";
  if (!ready)
    return (
      <p className="p-6" role="status">
        Loading…
      </p>
    );
  if (!authenticated)
    return (
      <div className="p-6">
        <Button onClick={() => login()}>Sign in</Button>
      </div>
    );
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">
            Release reviews
          </h1>
          <p className="mt-2 text-muted-foreground">
            Check saved metadata and its sources in your selected workspace.
          </p>
        </div>
        <Button
          variant="outline"
          disabled={!accountId || cases.busy}
          onClick={() => void cases.reload()}
        >
          Refresh list
        </Button>
      </div>
      {cases.error && (
        <p role="alert" className="text-destructive">
          {cases.error}
        </p>
      )}
      {cases.busy && <p role="status">Loading…</p>}
      {cases.loaded && !cases.error && cases.items.length === 0 && (
        <div className="rounded-xl p-6 shadow-[0_0_0_1px_var(--border)]">
          <p>No saved releases yet.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Ask Recoup to gather a release in this workspace, then return here
            to review its evidence.
          </p>
        </div>
      )}
      <ul className="space-y-2">
        {cases.items.map((item) => (
          <li key={item.request_id}>
            <Button
              variant="outline"
              className="h-auto min-h-11 w-full flex-col items-start justify-start whitespace-normal text-left sm:flex-row sm:items-center"
              disabled={cases.busy}
              onClick={() => void cases.open(item.request_id)}
              aria-label={`Open saved release ${item.url}`}
            >
              <span className="min-w-0 break-all">{item.url}</span>
              <span className="shrink-0 text-xs text-muted-foreground sm:ml-auto sm:pl-3">
                {new Date(item.created_at).toLocaleDateString()}
              </span>
            </Button>
          </li>
        ))}
      </ul>
      {cases.nextId && (
        <Button
          variant="outline"
          disabled={cases.busy}
          onClick={() => void cases.more()}
        >
          Load more releases
        </Button>
      )}
      {current && (
        <section
          className="space-y-5 rounded-xl p-6 shadow-[0_0_0_1px_var(--border)]"
          aria-label="Release case"
        >
          <div>
            <h2 className="text-xl font-semibold">
              {current.title ?? "Release metadata not collected"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {current.readiness === "blocked"
                ? "Evidence needs attention before review."
                : "Partial coverage · saved Spotify observations"}
            </p>
          </div>
          <ul className="list-disc space-y-2 pl-5 text-sm">
            {current.gaps.map((gap) => (
              <li key={gap}>{gap}</li>
            ))}
          </ul>
          {current.track_page.hasMore && (
            <p role="status">
              Showing the first 100 saved positions. This release is not fully
              displayed and cannot be marked reviewed here.
            </p>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="pb-3 text-left font-medium">
                Recording observations
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="p-2">
                    Track
                  </th>
                  <th scope="col" className="p-2">
                    Performing artists
                  </th>
                  <th scope="col" className="p-2">
                    Recording identity
                  </th>
                </tr>
              </thead>
              <tbody>
                {current.tracks.map((track) => {
                  const identity =
                    current.identity_observations.candidates.find(
                      (x) => x.slotIndex === track.slot_index,
                    );
                  return (
                    <tr key={track.slot_index}>
                      <td className="p-2">
                        {track.track_number ?? track.slot_index + 1}.{" "}
                        {track.title ?? "Title unavailable"}
                      </td>
                      <td className="p-2">
                        {track.credited_artists.map((x) => x.name).join(", ") ||
                          "Not collected"}
                      </td>
                      <td className="p-2">
                        {identity?.isrc ?? "ISRC not collected"}
                        <span className="block text-muted-foreground">
                          {identity?.mappingState.replaceAll("_", " ") ??
                            "Unresolved"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <details>
            <summary className="cursor-pointer py-2 font-medium">
              Evidence versions ({current.evidence_manifest.length})
            </summary>
            <ul className="space-y-3 text-sm">
              {current.evidence_manifest.map((source) => (
                <li key={`${source.result_id}:${source.source_version_id}`}>
                  <p className="break-all">{source.source_url}</p>
                  <p className="text-muted-foreground">
                    Captured {source.retrieved_at}
                  </p>
                  <code className="break-all text-xs">
                    {source.source_version_id}
                  </code>
                </li>
              ))}
            </ul>
          </details>
          {current.latest_review && (
            <p role="status">
              Last review: {current.latest_review.decision.replaceAll("_", " ")}
              {current.latest_review.stale
                ? " · evidence changed; review again"
                : " · current evidence"}
            </p>
          )}
          <div className="space-y-3">
            <label className="block text-sm font-medium" htmlFor="review-note">
              Review note
            </label>
            <Textarea
              id="review-note"
              value={note}
              maxLength={2000}
              onChange={(e) =>
                setNotes({ scope: noteScope, text: e.target.value })
              }
              disabled={cases.busy || !current.reviewable}
            />
            <p className="text-sm text-muted-foreground">
              This records your metadata review. Rights, distribution and
              collection require separate evidence and authorization. No
              provider or model calls are made by this review.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                disabled={cases.busy || !current.reviewable}
                onClick={() => void cases.review("reviewed", note)}
              >
                Mark metadata reviewed
              </Button>
              <Button
                variant="outline"
                disabled={cases.busy || !current.reviewable}
                onClick={() => void cases.review("needs_changes", note)}
              >
                Needs changes
              </Button>
              <Button
                variant="ghost"
                disabled={cases.busy}
                onClick={() => void cases.open(current.request_id)}
              >
                Reload case
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
