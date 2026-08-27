import React from "react";
import { Edit, Repeat } from "lucide-react";
import { Tables } from "@/types/database.types";
import { cn } from "@/lib/utils";
import { parseCronToHuman } from "@/lib/tasks/parseCronToHuman";
import { isRecurring } from "@/lib/tasks/isRecurring";
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
  const isActive = task.enabled && !isDeleted;
  const isPaused = !task.enabled && !isDeleted;

  return (
    <div
      className={cn(
        `group flex items-center justify-between py-4 px-4 hover:bg-muted dark:hover:bg-[#1a1a1a] transition-colors -mx-4`,
        {
          "opacity-70": isDeleted,
        },
      )}
    >
      <div className="flex items-center space-x-4">
        <TaskArtistImage artistAccountId={task.artist_account_id} />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-medium text-foreground">
              {task.title}
            </h4>
            {ownerEmail && (
              <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full">
                {ownerEmail}
              </span>
            )}
          </div>
          {artistName && (
            <span className="text-xs text-muted-foreground">{artistName}</span>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          {isRecurring(task.schedule) && (
            <Repeat className="h-4 w-4 text-muted-foreground dark:text-muted-foreground flex-shrink-0" />
          )}
          <span className="text-base text-muted-foreground dark:text-muted-foreground">
            {parseCronToHuman(task.schedule.trim())}
          </span>
        </div>
        <div className="flex items-center space-x-2 w-20 justify-end relative">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Edit className="h-5 w-5 text-muted-foreground dark:text-muted-foreground hover:text-muted-foreground dark:hover:text-muted-foreground cursor-pointer" />
          </div>
          <TaskCardMenu taskId={task.id} />
          {isActive && (
            <span className="px-2 py-1 text-xs font-medium bg-muted  text-muted-foreground dark:text-muted-foreground rounded-full group-hover:hidden absolute">
              Active
            </span>
          )}
          {isPaused && (
            <span className="px-2 py-1 text-xs font-medium bg-muted  text-muted-foreground dark:text-muted-foreground rounded-full group-hover:hidden absolute">
              Paused
            </span>
          )}
          {isDeleted && (
            <span className="px-2 py-1 text-xs font-medium bg-muted  text-muted-foreground dark:text-muted-foreground rounded-full group-hover:hidden absolute">
              Deleted
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
