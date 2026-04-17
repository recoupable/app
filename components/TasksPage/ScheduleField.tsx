"use client";

import { useMemo, useRef } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CronInput } from "./CronInput";
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
  const cronInputRef = useRef<HTMLInputElement>(null);

  const selectedPreset = useMemo(
    () =>
      SCHEDULE_PRESETS.find((preset) => preset.cron === schedule.trim())?.id ??
      CUSTOM_SCHEDULE_OPTION,
    [schedule],
  );

  const handlePresetChange = (value: string) => {
    if (value === CUSTOM_SCHEDULE_OPTION) {
      const matchesPresetCron = SCHEDULE_PRESETS.some(
        (preset) => preset.cron === schedule.trim(),
      );
      if (matchesPresetCron) {
        onScheduleChange("");
      }
      requestAnimationFrame(() => {
        cronInputRef.current?.focus();
      });
      return;
    }
    const preset = SCHEDULE_PRESETS.find((item) => item.id === value);
    if (preset) {
      onScheduleChange(preset.cron);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="task-schedule">Schedule (cron)</Label>
      <Select
        value={selectedPreset}
        onValueChange={handlePresetChange}
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
      <CronInput
        schedule={schedule}
        onScheduleChange={onScheduleChange}
        isSubmitting={isSubmitting}
        scheduleError={errors.schedule}
        inputRef={cronInputRef}
      />
    </div>
  );
}
