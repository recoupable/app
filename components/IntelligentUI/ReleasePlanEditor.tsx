"use client";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { useReleasePlan } from "@/lib/intelligent-ui/playground/release-plan/useReleasePlan";
import { getReleasePlanPreview } from "@/lib/intelligent-ui/playground/release-plan/getReleasePlanPreview";
import { getReleasePlanText } from "@/lib/intelligent-ui/playground/release-plan/getReleasePlanText";
import type { ReleasePlanFixture } from "@/lib/intelligent-ui/playground/release-plan/types";
import ReleasePlanHeader from "./ReleasePlanHeader";
import ReleasePlanForm from "./ReleasePlanForm";
import ReleasePlanWorkingDates from "./ReleasePlanWorkingDates";
import ReleasePlanReview from "./ReleasePlanReview";
import ReleasePlanReadable from "./ReleasePlanReadable";
interface Props {
  fixture: ReleasePlanFixture;
}
export default function ReleasePlanEditor({ fixture }: Props) {
  const editor = useReleasePlan(fixture);
  const reviewButton = useRef<HTMLButtonElement>(null);
  const { resolved, error } = getReleasePlanPreview(editor.edits);
  const text = getReleasePlanText(
    fixture,
    resolved?.edits ?? editor.base.edits,
    editor.base.version,
  );
  return (
    <section
      id="conversation"
      aria-label="Local release plan"
      className="space-y-6"
    >
      <ReleasePlanHeader fixture={fixture} version={editor.base.version} />
      <p role="status" className="text-sm leading-6">
        {editor.message}
      </p>
      <ReleasePlanForm
        edits={editor.edits}
        ready={editor.ready}
        canReview={!!resolved}
        error={error}
        reviewButton={reviewButton}
        onChange={editor.update}
        onReview={editor.prepare}
      />
      {resolved && <ReleasePlanWorkingDates plan={resolved} />}
      {editor.review && (
        <ReleasePlanReview
          version={editor.base.version}
          changes={editor.review.changes}
          disabled={
            !editor.canSave || !resolved || resolved.conflicts.length > 0
          }
          onSave={() => {
            editor.save();
            reviewButton.current?.focus();
          }}
        />
      )}
      <Button
        type="button"
        variant="outline"
        disabled={!editor.ready}
        onClick={editor.restore}
        className="min-h-11 h-auto whitespace-normal text-left"
      >
        Reload saved version (discard working edits)
      </Button>
      <ReleasePlanReadable text={text} hasValidInputs={!!resolved} />
      <p className="text-sm leading-6 text-muted-foreground">
        Scheduling, distribution, rights approval and publication are
        unavailable here. Local saves survive reload in this tab, not closing
        the tab. Nothing is sent to an account, service or task queue.
      </p>
    </section>
  );
}
