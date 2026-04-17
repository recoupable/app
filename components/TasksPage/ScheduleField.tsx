"use client";

import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCronHumanPreview } from "@/lib/tasks/validateCronExpression";
import { CUSTOM_SCHEDULE_OPTION, SCHEDULE_PRESETS } from "./schedulePresets";

type ScheduleErrors = { schedule?: string };

interface ScheduleFieldProps {
  schedule: string;
  onScheduleChange: (value: string) => void;
  isSubmitting: boolean;
  errors: ScheduleErrors;
}

export function ScheduleField({
  schedule,
  onScheduleChange,
  isSubmitting,
  errors,
}: ScheduleFieldProps) {
  const selectedPreset = useMemo(
    () =>
      SCHEDULE_PRESETS.find((preset) => preset.cron === schedule.trim())?.id ??
      CUSTOM_SCHEDULE_OPTION,
    [schedule],
  );

  const cronPreview = useMemo(
    () => getCronHumanPreview(schedule),
    [schedule],
  );

  const scheduleInvalid = Boolean(errors.schedule);

  return (
    <div className="space-y-2">
      <Label htmlFor="task-schedule">Schedule (cron)</Label>
      <Select
        value={selectedPreset}
        onValueChange={(value) => {
          const preset = SCHEDULE_PRESETS.find((item) => item.id === value);
          if (preset) {
            onScheduleChange(preset.cron);
          }
        }}
        disabled={isSubmitting}
      >
        <SelectTrigger id="task-schedule-presets">
          <SelectValue placeholder="Choose a common schedule" />
        </SelectTrigger>
        <SelectContent>
          {SCHEDULE_PRESETS.map((preset) => (
            <SelectItem key={preset.id} value={preset.id}>
              {preset.label}
            </SelectItem>
          ))}
          <SelectItem value={CUSTOM_SCHEDULE_OPTION}>Custom cron</SelectItem>
        </SelectContent>
      </Select>
      <Input
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
      {errors.schedule ? (
        <p
          id="task-schedule-error"
          role="alert"
          className="text-sm text-red-600"
        >
          {errors.schedule}
        </p>
      ) : null}
    </div>
  );
}
