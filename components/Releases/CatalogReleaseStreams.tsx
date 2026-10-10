"use client";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useReleaseStreams } from "@/hooks/useReleaseStreams";
import { useReleaseCatalogSongs } from "@/hooks/useReleaseCatalogSongs";
import { buildCatalogStreamReleases } from "@/lib/releases/buildCatalogStreamReleases";
import CatalogReleaseSelector from "./CatalogReleaseSelector";
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
          selectedIsrc={[]}
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
      <CatalogReleaseSelector
        releases={releases}
        selectedId={selected?.id ?? ""}
        songCount={metadata.songs.length}
        onSelect={(releaseId) =>
          setSelection({ catalogId: streams.catalogId, releaseId })
        }
      />
      <ReleaseStreamPanel
        key={JSON.stringify([streams.catalogId, current.id])}
        current={current}
        data={{ ...streams, refresh }}
      />
    </div>
  );
}
