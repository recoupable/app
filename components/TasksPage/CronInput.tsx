"use client";

import type { Ref } from "react";
import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { getCronHumanPreview } from "@/lib/tasks/getCronHumanPreview";

interface CronInputProps {
  schedule: string;
  onScheduleChange: (value: string) => void;
  isSubmitting: boolean;
  scheduleError?: string;
  inputRef?: Ref<HTMLInputElement>;
}

/**
 * Manual cron expression input with hint, preview, and validation messaging.
 */
export function CronInput({
  schedule,
  onScheduleChange,
  isSubmitting,
  scheduleError,
  inputRef,
}: CronInputProps) {
  const cronPreview = useMemo(
    () => getCronHumanPreview(schedule),
    [schedule],
  );

  const scheduleInvalid = Boolean(scheduleError);

  return (
    <>
      <Input
        ref={inputRef}
        id="task-schedule"
        placeholder="Use 5-part cron, e.g. 0 9 * * *"
        value={schedule}
        onChange={(event) => onScheduleChange(event.target.value)}
        disabled={isSubmitting}
        aria-invalid={scheduleInvalid}
        aria-describedby={
          [
            "task-schedule-hint",
            cronPreview ? "task-schedule-preview" : null,
            scheduleInvalid ? "task-schedule-error" : null,
          ]
            .filter(Boolean)
            .join(" ") || undefined
        }
      />
      <p id="task-schedule-hint" className="text-xs text-muted-foreground">
        Cron format:{" "}
        <span className="font-mono">minute hour day month weekday</span>.
        Example: <span className="font-mono">0 9 * * *</span>.
      </p>
      {cronPreview ? (
        <p id="task-schedule-preview" className="text-xs text-muted-foreground">
          Runs: {cronPreview}
        </p>
      ) : null}
      {scheduleError ? (
        <p
          id="task-schedule-error"
          role="alert"
          className="text-sm text-red-600"
        >
          {scheduleError}
        </p>
      ) : null}
    </>
  );
}
