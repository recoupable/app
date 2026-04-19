"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTaskFormContext } from "@/providers/CreateTaskFormProvider";

export function CreateTaskPromptField() {
  const { prompt, setPrompt, isSubmitting, errors } = useCreateTaskFormContext();

  return (
    <div className="space-y-2">
      <Label htmlFor="task-prompt">Prompt</Label>
      <Textarea
        id="task-prompt"
        placeholder="Summarize fan growth and top events from yesterday."
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        rows={6}
        disabled={isSubmitting}
        aria-invalid={Boolean(errors.prompt)}
        aria-describedby={errors.prompt ? "task-prompt-error" : undefined}
      />
      {errors.prompt ? (
        <p id="task-prompt-error" role="alert" className="text-sm text-red-600">
          {errors.prompt}
        </p>
      ) : null}
    </div>
  );
}
