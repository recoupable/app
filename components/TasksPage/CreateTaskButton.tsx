"use client";

import { Button } from "@/components/ui/button";
import { useCreateTask } from "@/hooks/useCreateTask";

export function CreateTaskButton() {
  const { handleCreateTask, isCreating } = useCreateTask();

  return (
    <Button
      onClick={() => handleCreateTask()}
      disabled={isCreating}
      className="w-full sm:w-auto"
    >
      {isCreating ? "Creating..." : "Create Task"}
    </Button>
  );
}
