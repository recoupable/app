"use client";

import { Check, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSetProjectTaskComplete } from "@/hooks/useSetProjectTaskComplete";

/**
 * The completion control. Any collaborator may close or reopen any task,
 * including the client — the API records who did it either way.
 */
const ProjectTaskCompletion = ({
  projectId,
  taskId,
  isComplete,
}: {
  projectId: string;
  taskId: string;
  isComplete: boolean;
}) => {
  const { mutate, isPending } = useSetProjectTaskComplete(projectId, taskId);

  if (isComplete) {
    return (
      <div className="flex items-center gap-4">
        <span className="inline-flex items-center gap-2 text-sm font-medium">
          <CheckCircle2 className="size-4.5 text-green-500" />
          Completed
        </span>
        <button
          type="button"
          onClick={() => mutate(false)}
          disabled={isPending}
          className="text-sm text-muted-foreground underline underline-offset-4 disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Mark incomplete"}
        </button>
      </div>
    );
  }

  return (
    <Button onClick={() => mutate(true)} disabled={isPending}>
      <Check className="size-4" />
      {isPending ? "Saving…" : "Mark complete"}
    </Button>
  );
};

export default ProjectTaskCompletion;
