import { useState } from "react";
import type { ReleaseCase } from "@/lib/releases/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
interface Props {
  current: ReleaseCase;
  busy: boolean;
  onReview: (
    decision: "reviewed" | "needs_changes",
    note: string,
  ) => Promise<void>;
  onReload: () => Promise<void>;
}
export default function ReleaseCaseReviewForm({
  current,
  busy,
  onReview,
  onReload,
}: Props) {
  const [note, setNote] = useState("");
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium" htmlFor="review-note">
        Review note
      </label>
      <Textarea
        id="review-note"
        value={note}
        maxLength={2000}
        onChange={(e) => setNote(e.target.value)}
        disabled={busy || !current.reviewable}
      />
      <p className="text-sm text-muted-foreground">
        This records your metadata review. Rights, distribution and collection
        require separate evidence and authorization. No provider or model calls
        are made by this review.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button
          disabled={busy || !current.reviewable}
          onClick={() => void onReview("reviewed", note)}
        >
          Mark metadata reviewed
        </Button>
        <Button
          variant="outline"
          disabled={busy || !current.reviewable}
          onClick={() => void onReview("needs_changes", note)}
        >
          Needs changes
        </Button>
        <Button variant="ghost" disabled={busy} onClick={() => void onReload()}>
          Reload case
        </Button>
      </div>
    </div>
  );
}
