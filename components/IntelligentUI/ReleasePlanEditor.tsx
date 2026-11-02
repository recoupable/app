"use client";
import { useRef } from "react";
import { ZodError } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useReleasePlan } from "@/lib/intelligent-ui/playground/release-plan/useReleasePlan";
import { resolveReleasePlan } from "@/lib/intelligent-ui/playground/release-plan/resolveReleasePlan";
import { getReleasePlanText } from "@/lib/intelligent-ui/playground/release-plan/getReleasePlanText";
import {
  taskLabels,
  type ReleasePlanFixture,
  type ResolvedPlan,
} from "@/lib/intelligent-ui/playground/release-plan/types";
import ReleasePlanTaskFields from "./ReleasePlanTaskFields";

export default function ReleasePlanEditor({
  fixture,
}: {
  fixture: ReleasePlanFixture;
}) {
  const editor = useReleasePlan(fixture);
  const reviewButton = useRef<HTMLButtonElement>(null);
  let resolved: ResolvedPlan | null = null;
  let error = "";
  try {
    resolved = resolveReleasePlan(editor.edits);
  } catch (reason) {
    error =
      reason instanceof ZodError
        ? reason.issues.map((issue) => issue.message).join(" ")
        : reason instanceof Error
          ? reason.message
          : "Check your plan values.";
  }
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
      <div className="space-y-2">
        <h2 className="text-xl font-medium">Plan {fixture.label}</h2>
        <p className="text-sm leading-6">
          Edit dates, review what would move, then save a local version in this
          tab. This synthetic plan does not approve tasks or schedule a release.
        </p>
        <p className="text-sm text-muted-foreground">
          {fixture.scope.workspaceId} / {fixture.scope.releaseId} · worksheet
          revision {fixture.scope.sourceRevision} · local version{" "}
          {editor.base.version || "not saved"}
        </p>
      </div>
      <details>
        <summary className="min-h-11 cursor-pointer py-2 text-sm">
          Source and date rules
        </summary>
        <div className="space-y-3 text-sm leading-6">
          <p>{fixture.sourceText}</p>
          <p>
            The starting goal, date, timezone and offsets are authored planning
            examples, not claims from the worksheet. All dates are Gregorian
            calendar dates in the named IANA timezone. Offsets count calendar
            days, including weekends. No clock time is scheduled; timezone
            changes do not shift dates. DST does not add or subtract a planning
            day.
          </p>
          <p>
            Offsets range from −365 to 365 days. A task anchored to another task
            must not precede it; these preparation tasks must not fall after
            release. Dependencies must not form a cycle. Manual dates override
            offsets and remain fixed when dates change.
          </p>
        </div>
      </details>
      <p role="status" className="text-sm leading-6">
        {editor.message}
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (resolved) editor.prepare();
        }}
        className="space-y-5"
        noValidate
      >
        <fieldset disabled={!editor.ready} className="space-y-5">
          <legend className="sr-only">Local plan edits</legend>
          <div className="space-y-2">
            <Label htmlFor="release-goal">Goal</Label>
            <Input
              id="release-goal"
              maxLength={240}
              value={editor.edits.goal}
              onChange={(event) =>
                editor.update({ ...editor.edits, goal: event.target.value })
              }
              className="min-h-11 focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="release-date">Release date</Label>
              <Input
                id="release-date"
                type="date"
                min="1900-01-01"
                max="2100-12-31"
                value={editor.edits.releaseDate}
                onChange={(event) =>
                  editor.update({
                    ...editor.edits,
                    releaseDate: event.target.value,
                  })
                }
                className="min-h-11 focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="release-zone">IANA timezone</Label>
              <Input
                id="release-zone"
                maxLength={100}
                value={editor.edits.timeZone}
                onChange={(event) =>
                  editor.update({
                    ...editor.edits,
                    timeZone: event.target.value,
                  })
                }
                aria-describedby="zone-help"
                className="min-h-11 focus-visible:ring-2 focus-visible:ring-ring"
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
              tasks={editor.edits.tasks}
              onChange={(tasks) => editor.update({ ...editor.edits, tasks })}
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
            disabled={!resolved}
            className="min-h-11"
          >
            Review local changes
          </Button>
        </fieldset>
      </form>
      {resolved && (
        <div className="space-y-3" aria-label="Working dates">
          <h3 className="text-sm font-medium">Working dates</h3>
          <ul className="space-y-3 text-sm leading-6">
            {resolved.tasks.map((task) => (
              <li key={task.id}>
                <span className="font-medium">{taskLabels[task.id]}</span>:{" "}
                {task.date} · pending
                {task.manual && (
                  <span className="block text-muted-foreground">
                    Manual date retained. Offset proposes {task.proposedDate}.
                  </span>
                )}
              </li>
            ))}
          </ul>
          {!!resolved.conflicts.length && (
            <div
              role="alert"
              className="space-y-2 text-sm text-destructive-text"
            >
              <p>Resolve these conflicts before saving:</p>
              <ul className="list-disc pl-5">
                {resolved.conflicts.map((conflict) => (
                  <li key={conflict}>{conflict}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {editor.review && (
        <section
          aria-label="Proposed local version"
          className="space-y-3 rounded-xl border border-border p-4"
        >
          <h3 className="font-medium">
            Review local version {editor.base.version + 1}
          </h3>
          {editor.review.changes.length ? (
            <ul className="list-disc space-y-2 pl-5 text-sm leading-6">
              {editor.review.changes.map((change) => (
                <li key={change}>{change}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm">
              No changes from{" "}
              {editor.base.version
                ? "the saved version. Saving again will not create a duplicate."
                : "the example defaults. This will create the first local version."}
            </p>
          )}
          <p className="text-sm">
            Only this tab&apos;s plan is saved. Pending tasks stay pending.
          </p>
          <Button
            type="button"
            disabled={
              !editor.canSave || !resolved || resolved.conflicts.length > 0
            }
            onClick={() => {
              editor.save();
              reviewButton.current?.focus();
            }}
            className="min-h-11"
          >
            Save local version
          </Button>
        </section>
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
      <details open>
        <summary className="min-h-11 cursor-pointer py-2 text-sm">
          Readable plan
        </summary>
        <p className="mb-2 text-sm text-muted-foreground">
          {resolved
            ? "Working copy; only explicit Save stores a version."
            : "Last valid saved plan or example defaults; current inputs need correction."}
        </p>
        <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-6">
          {text}
        </pre>
      </details>
      <p className="text-sm leading-6 text-muted-foreground">
        Scheduling, distribution, rights approval and publication are
        unavailable here. Local saves survive reload in this tab, not closing
        the tab. Nothing is sent to an account, service or task queue.
      </p>
    </section>
  );
}
