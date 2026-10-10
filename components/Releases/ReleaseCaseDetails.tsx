import { Disc3, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReleaseCase } from "@/lib/releases/types";
import ReleaseCaseTracks from "./ReleaseCaseTracks";
import ReleaseCaseEvidence from "./ReleaseCaseEvidence";
import ReleaseCaseReviewForm from "./ReleaseCaseReviewForm";
interface Props {
  current: ReleaseCase;
  sourceUrl?: string;
  busy: boolean;
  onReview: (
    decision: "reviewed" | "needs_changes",
    note: string,
  ) => Promise<void>;
  onReload: () => Promise<void>;
}
export default function ReleaseCaseDetails({
  current,
  sourceUrl,
  busy,
  onReview,
  onReload,
}: Props) {
  const awaitingMetadata =
    !current.title && current.tracks.length === 0 && !current.reviewable;
  return (
    <section
      className="overflow-hidden rounded-2xl bg-background shadow-[0_0_0_1px_var(--border)]"
      aria-label="Release case"
    >
      <header className="flex items-center gap-4 p-6">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-muted">
          <Disc3 className="size-8 text-muted-foreground" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Release overview
          </p>
          <h2 className="text-xl font-semibold">
            {current.title ?? "Spotify release"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {awaitingMetadata
              ? "Link saved · no collected review metadata"
              : `${current.tracks.length} saved tracks · ${current.reviewable ? "Ready for metadata review" : "Needs attention"}`}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          disabled={busy}
          onClick={() => void onReload()}
          aria-label="Refresh release"
        >
          <RefreshCw className="size-4" />
        </Button>
      </header>
      <div className="space-y-6 px-6 pb-6">
        {awaitingMetadata ? (
          <div className="rounded-xl bg-muted/50 p-5">
            <h3 className="font-medium">Your release link is saved</h3>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
              This review has no collected track details yet. Your saved catalog
              recordings and charts remain available above.
            </p>
            {sourceUrl && (
              <Button asChild variant="outline" className="mt-4">
                <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
                  Open release on Spotify
                  <ExternalLink className="ml-2 size-3.5" />
                </a>
              </Button>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              Metadata collection is not available from this page yet. You can
              preview the saved evidence below.
            </p>
          </div>
        ) : (
          <ReleaseCaseTracks current={current} />
        )}
        {current.track_page.hasMore && (
          <p role="status" className="text-sm text-muted-foreground">
            Showing the first 100 saved positions. This release is not fully
            displayed and cannot be marked reviewed here.
          </p>
        )}
        {current.latest_review && (
          <p role="status" className="text-sm">
            Last review: {current.latest_review.decision.replaceAll("_", " ")}
            {current.latest_review.stale
              ? " · evidence changed; review again"
              : " · current evidence"}
          </p>
        )}
        {!awaitingMetadata && (
          <ReleaseCaseReviewForm
            current={current}
            busy={busy}
            onReview={onReview}
            onReload={onReload}
          />
        )}
        <details className="rounded-xl bg-muted/30 px-4 py-3 text-sm">
          <summary className="cursor-pointer font-medium">
            Sources and coverage
          </summary>
          <div className="mt-4 space-y-4">
            {sourceUrl && (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block break-all text-xs text-muted-foreground underline underline-offset-4"
              >
                {sourceUrl}
              </a>
            )}
            <ul className="list-disc space-y-2 pl-4 text-muted-foreground">
              {current.gaps.map((gap) => (
                <li key={gap}>{gap}</li>
              ))}
            </ul>
            {current.evidence_manifest.length > 0 ? (
              <ReleaseCaseEvidence current={current} />
            ) : (
              <p className="text-muted-foreground">
                No collected metadata sources yet.
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Metadata review does not establish rights or authorize
              distribution.
            </p>
          </div>
        </details>
      </div>
    </section>
  );
}
