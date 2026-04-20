"use client";

import dynamic from "next/dynamic";
import { useCreateTaskFormContext } from "@/providers/CreateTaskFormProvider";

const CronEditor = dynamic(
  () => import("@/components/CronEditor").then((m) => ({ default: m.CronEditor })),
  { ssr: false },
);

export function ScheduleField() {
  const { schedule, setSchedule, isSubmitting, errors } =
    useCreateTaskFormContext();

  return (
    <div className="space-y-2">
      <CronEditor
        cronExpression={schedule}
        onCronExpressionChange={setSchedule}
        disabled={isSubmitting}
      />
      {errors.schedule ? (
        <p id="task-schedule-error" role="alert" className="text-sm text-red-600">
          {errors.schedule}
        </p>
      ) : null}
    </div>
  );
}
