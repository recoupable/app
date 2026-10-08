import type { ReleaseCase } from "@/lib/releases/types";
import ReleaseCaseTracks from "./ReleaseCaseTracks";
import ReleaseCaseEvidence from "./ReleaseCaseEvidence";
import ReleaseCaseReviewForm from "./ReleaseCaseReviewForm";
interface Props {
  current: ReleaseCase;
  busy: boolean;
  onReview: (
    decision: "reviewed" | "needs_changes",
    note: string,
  ) => Promise<void>;
  onReload: () => Promise<void>;
}
export default function ReleaseCaseDetails({
  current,
  busy,
  onReview,
  onReload,
}: Props) {
  return (
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
      <ReleaseCaseTracks current={current} />
      <ReleaseCaseEvidence current={current} />
      {current.latest_review && (
        <p role="status">
          Last review: {current.latest_review.decision.replaceAll("_", " ")}
          {current.latest_review.stale
            ? " · evidence changed; review again"
            : " · current evidence"}
        </p>
      )}
      <ReleaseCaseReviewForm
        current={current}
        busy={busy}
        onReview={onReview}
        onReload={onReload}
      />
    </section>
  );
}
