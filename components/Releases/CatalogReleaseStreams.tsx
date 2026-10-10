"use client";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useReleaseStreams } from "@/hooks/useReleaseStreams";
import { useReleaseCatalogSongs } from "@/hooks/useReleaseCatalogSongs";
import { buildCatalogStreamReleases } from "@/lib/releases/buildCatalogStreamReleases";
import ReleaseStreamPanel from "./ReleaseStreamPanel";
import ReleaseStreamControls from "./ReleaseStreamControls";
import ReleaseStreamRequestStates from "./ReleaseStreamRequestStates";
export default function CatalogReleaseStreams({
  accountId,
  organizationId,
  getAccessToken,
}: {
  accountId: string;
  organizationId: string | null;
  getAccessToken: () => Promise<string | null>;
}) {
  const streams = useReleaseStreams(accountId, getAccessToken, organizationId);
  const metadata = useReleaseCatalogSongs(streams.catalogId, getAccessToken);
  const releases = useMemo(
    () => buildCatalogStreamReleases(metadata.songs),
    [metadata.songs],
  );
  const [selection, setSelection] = useState({ catalogId: "", releaseId: "" });
  const selected =
    selection.catalogId === streams.catalogId
      ? releases.find((release) => release.id === selection.releaseId)
      : undefined;
  const current = selected ?? {
    id: "all",
    title: "All releases",
    recordings: releases.flatMap((release) => release.recordings),
    complete: true,
  };
  const refresh = () => {
    metadata.refresh();
    streams.refresh();
  };
  if (
    !streams.catalogId ||
    metadata.loading ||
    metadata.error ||
    !releases.length
  )
    return (
      <div className="space-y-4">
        <ReleaseStreamControls
          data={streams}
          series={null}
          selectedIsrc=""
          setSelectedIsrc={() => {}}
        />
        <ReleaseStreamRequestStates data={streams} />
        {metadata.loading && (
          <p role="status" className="text-sm text-muted-foreground">
            Loading releases…
          </p>
        )}
        {metadata.error && (
          <div className="space-y-3">
            <p role="alert">{metadata.error}</p>
            <Button variant="outline" onClick={refresh}>
              Retry releases
            </Button>
          </div>
        )}
        {streams.catalogId &&
          !metadata.loading &&
          !metadata.error &&
          !releases.length && (
            <p className="text-sm text-muted-foreground">
              No recordings in this catalog yet.
            </p>
          )}
      </div>
    );
  return (
    <div className="space-y-4">
      <select
        aria-label="Release"
        className="h-11 max-w-full rounded-lg bg-background pl-3 pr-8 text-sm shadow-[0_0_0_1px_var(--input)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-10"
        value={selected?.id ?? ""}
        onChange={(event) =>
          setSelection({
            catalogId: streams.catalogId,
            releaseId: event.target.value,
          })
        }
      >
        <option value="">All releases · {metadata.songs.length} songs</option>
        {releases.map((release) => (
          <option key={release.id} value={release.id}>
            {release.title} · {release.recordings.length} songs
          </option>
        ))}
      </select>
      <ReleaseStreamPanel
        key={JSON.stringify([streams.catalogId, current.id])}
        current={current}
        data={{ ...streams, refresh }}
      />
    </div>
  );
}
