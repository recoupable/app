"use client";

import { XCircle } from "lucide-react";
import { useTask } from "@/hooks/useTask";
import RunPageSkeleton from "@/components/TasksPage/Run/RunPageSkeleton";
import TaskBreadcrumb from "./TaskBreadcrumb";
import TaskPageHeader from "./TaskPageHeader";
import TaskEditor from "./TaskEditor";

/**
 * `/tasks/{taskId}`: the one place a task is viewed and edited (chat#2006
 * items 2 and 8). Name, instructions, schedule, timezone and model are
 * editable with Save, Pause / Resume and Delete; below them the task's run
 * history from Trigger.dev, each recent run linking to its run page.
 */
export default function TaskPage({ taskId }: { taskId: string }) {
  const { data: task, isLoading, error } = useTask(taskId);

  if (isLoading) {
    return (
      <div className="h-screen max-w-2xl">
        <TaskBreadcrumb title="…" />
        <RunPageSkeleton />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="h-screen max-w-2xl">
        <TaskBreadcrumb title="Not found" />
        <div className="flex flex-col items-center justify-center p-6">
          <XCircle className="size-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground" role="status">
            {error instanceof Error
              ? error.message
              : "No task with this id on your account."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen max-w-2xl">
      <TaskBreadcrumb title={task.title} />
      <div className="mx-auto flex flex-col gap-4 p-6">
        <TaskPageHeader task={task} />
        <TaskEditor key={task.updated_at ?? task.id} task={task} />
      </div>
    </div>
  );
}
