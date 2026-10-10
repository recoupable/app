import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { useReleaseStreams } from "@/hooks/useReleaseStreams";
export default function ReleaseStreamRequestStates({
  data,
}: {
  data: ReturnType<typeof useReleaseStreams>;
}) {
  return (
    <>
      {data.catalogsLoading && <p role="status">Loading workspace catalogs…</p>}
      {data.catalogError && (
        <div>
          <p role="alert">{data.catalogError}</p>
          <Button
            variant="outline"
            className="mt-2"
            onClick={data.retryCatalogs}
          >
            Retry catalogs
          </Button>
        </div>
      )}
      {!data.catalogsLoading &&
        !data.catalogError &&
        data.catalogs.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Add these recordings to a workspace catalog to track daily streams.{" "}
            <Link href="/catalogs" className="underline underline-offset-4">
              Open catalogs
            </Link>
          </p>
        )}
      {!data.catalogId && data.catalogs.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Choose the catalog containing this release’s recordings.
        </p>
      )}
      {data.loading && <p role="status">Loading saved streams…</p>}
      {data.error && (
        <div className="space-y-2">
          <p role="alert">{data.error}</p>
          <Button variant="outline" size="sm" onClick={data.refresh}>
            Retry
          </Button>
        </div>
      )}
      {data.mutationError && <p role="alert">{data.mutationError}</p>}
    </>
  );
}
