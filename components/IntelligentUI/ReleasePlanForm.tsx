import type { RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ReleasePlanEdits } from "@/lib/intelligent-ui/playground/release-plan/types";
import {
  MIN_DATE,
  MAX_DATE,
} from "@/lib/intelligent-ui/playground/release-plan/limits";
import ReleasePlanTaskFields from "./ReleasePlanTaskFields";
interface Props {
  edits: ReleasePlanEdits;
  ready: boolean;
  canReview: boolean;
  error: string;
  reviewButton: RefObject<HTMLButtonElement | null>;
  onChange: (edits: ReleasePlanEdits) => void;
  onReview: () => void;
}
export default function ReleasePlanForm({
  edits,
  ready,
  canReview,
  error,
  reviewButton,
  onChange,
  onReview,
}: Props) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (canReview) onReview();
      }}
      className="space-y-5"
      noValidate
    >
      <fieldset disabled={!ready} className="space-y-5">
        <legend className="sr-only">Local plan edits</legend>
        <div className="space-y-2">
          <Label htmlFor="release-goal">Goal</Label>
          <Input
            id="release-goal"
            maxLength={240}
            value={edits.goal}
            onChange={(event) =>
              onChange({ ...edits, goal: event.target.value })
            }
            className="min-h-11 border-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="release-date">Release date</Label>
            <Input
              id="release-date"
              type="date"
              min={MIN_DATE}
              max={MAX_DATE}
              value={edits.releaseDate}
              onChange={(event) =>
                onChange({
                  ...edits,
                  releaseDate: event.target.value,
                })
              }
              className="min-h-11 border-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="release-zone">IANA timezone</Label>
            <Input
              id="release-zone"
              maxLength={100}
              value={edits.timeZone}
              onChange={(event) =>
                onChange({
                  ...edits,
                  timeZone: event.target.value,
                })
              }
              aria-describedby="zone-help"
              className="min-h-11 border-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
            <p id="zone-help" className="text-sm text-muted-foreground">
              For example, America/New_York or UTC.
            </p>
          </div>
        </div>
        <details>
          <summary className="min-h-11 cursor-pointer py-2 text-sm">
            Edit task offsets, dependencies and manual dates
          </summary>
          <ReleasePlanTaskFields
            tasks={edits.tasks}
            onChange={(tasks) => onChange({ ...edits, tasks })}
          />
        </details>
        {error && (
          <p role="alert" className="text-sm text-destructive-text">
            {error}
          </p>
        )}
        <Button
          ref={reviewButton}
          type="submit"
          disabled={!canReview}
          className="min-h-11"
        >
          Review local changes
        </Button>
      </fieldset>
    </form>
  );
}
