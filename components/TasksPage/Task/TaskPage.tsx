"use client";

import { XCircle } from "lucide-react";
import { useTask } from "@/hooks/useTask";
import { getTaskTimezone } from "@/lib/timezone/getTaskTimezone";
import { DEFAULT_MODEL } from "@/lib/consts";
import RunPageSkeleton from "@/components/TasksPage/Run/RunPageSkeleton";
import TaskDetailsDialogContent from "@/components/VercelChat/dialogs/tasks/TaskDetailsDialogContent";
import TaskBreadcrumb from "./TaskBreadcrumb";
import TaskPageHeader from "./TaskPageHeader";

const noop = () => {};

/**
 * `/tasks/{taskId}` (chat#2006 item 2): a task with zero runs finally has
 * a page. Read-only view of the same sections the task dialog renders:
 * prompt, schedule + timezone, model, last run, recent runs (linking to
 * their run pages), and upcoming runs. Editing stays in the dialog.
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
        <TaskDetailsDialogContent
          task={task}
          editTitle={task.title}
          editPrompt={task.prompt}
          editCron={task.schedule}
          editModel={task.model || DEFAULT_MODEL}
          editTimezone={getTaskTimezone(task)}
          onTitleChange={noop}
          onPromptChange={noop}
          onCronChange={noop}
          onModelChange={noop}
          onTimezoneChange={noop}
          canEdit={false}
        />
      </div>
    </div>
  );
}
