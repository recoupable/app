"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateTaskFormContext } from "@/providers/CreateTaskFormProvider";

export function CreateTaskTitleField() {
  const { title, setTitle, isSubmitting, errors } = useCreateTaskFormContext();

  return (
    <div className="space-y-2">
      <Label htmlFor="task-title">Title</Label>
      <Input
        id="task-title"
        placeholder="Daily summary"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        disabled={isSubmitting}
        aria-invalid={Boolean(errors.title)}
        aria-describedby={errors.title ? "task-title-error" : undefined}
      />
      {errors.title ? (
        <p id="task-title-error" role="alert" className="text-sm text-red-600">
          {errors.title}
        </p>
      ) : null}
    </div>
  );
}
