import React from "react";
import Link from "next/link";
import { Repeat } from "lucide-react";
import { Tables } from "@/types/database.types";
import { cn } from "@/lib/utils";
import { parseCronToHuman } from "@/lib/tasks/parseCronToHuman";
import { isRecurring } from "@/lib/tasks/isRecurring";
import { getTaskHref } from "@/lib/tasks/getTaskHref";
import TaskArtistImage from "./TaskArtistImage";
import TaskCardMenu from "./TaskCardMenu";

type ScheduledAction = Tables<"scheduled_actions">;

export interface TaskCardProps {
  task: ScheduledAction;
  isDeleted?: boolean;
  ownerEmail?: string;
  /** Shown under the title; the task list is account-wide (chat#2006 item 6). */
  artistName?: string | null;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isDeleted,
  ownerEmail,
  artistName,
}) => {
  const schedule = task.schedule?.trim() ?? "";
  const statusLabel = isDeleted
    ? "Deleted"
    : task.enabled
      ? "Active"
      : "Paused";
  const content = (
    <>
      <TaskArtistImage artistAccountId={task.artist_account_id} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h4 className="min-w-0 break-words text-base font-medium text-foreground">
            {task.title}
          </h4>
          {ownerEmail && (
            <span className="max-w-full break-all rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
              {ownerEmail}
            </span>
          )}
        </div>
        {artistName && (
          <span className="block break-words text-xs text-muted-foreground">
            {artistName}
          </span>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium">
            {statusLabel}
          </span>
          <span className="inline-flex min-w-0 items-start gap-1.5">
            {schedule && isRecurring(schedule) && (
              <Repeat className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <span className="break-words">
              {schedule ? parseCronToHuman(schedule) : "No schedule"}
            </span>
          </span>
        </div>
      </div>
    </>
  );

  return (
    <div
      className={cn(
        "group -mx-4 flex items-center gap-3 px-4 py-4 transition-colors hover:bg-muted",
        isDeleted && "opacity-70",
      )}
    >
      {isDeleted ? (
        <div className="flex min-w-0 flex-1 items-center gap-4">{content}</div>
      ) : (
        <Link
          href={getTaskHref(task.id)}
          className="flex min-w-0 flex-1 items-center gap-4 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {content}
        </Link>
      )}
      {!isDeleted && (
        <TaskCardMenu
          taskId={task.id}
          taskTitle={task.title}
          enabled={Boolean(task.enabled)}
        />
      )}
    </div>
  );
};

export default TaskCard;
