import React, { useState } from "react";
import {
  Edit,
  Repeat,
  MoreHorizontal,
  Pause,
  Trash2,
  Clock,
} from "lucide-react";
import { Tables } from "@/types/database.types";
import { cn } from "@/lib/utils";
import { parseCronToHuman } from "@/lib/tasks/parseCronToHuman";
import { isRecurring } from "@/lib/tasks/isRecurring";
import { useUpdateScheduledAction } from "@/hooks/useUpdateScheduledAction";
import { useDeleteScheduledAction } from "@/hooks/useDeleteScheduledAction";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TaskArtistImage from "./TaskArtistImage";

type ScheduledAction = Tables<"scheduled_actions">;

export interface TaskCardProps {
  task: ScheduledAction;
  isDeleted?: boolean;
  ownerEmail?: string;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, isDeleted, ownerEmail }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { updateAction, isLoading: isUpdating } = useUpdateScheduledAction();
  const { deleteAction, isLoading: isDeleting } = useDeleteScheduledAction();
  const isActive = task.enabled && !isDeleted;
  const isPaused = !task.enabled && !isDeleted;

  const handlePause = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the edit dialog
    try {
      await updateAction({
        updates: { id: task.id, enabled: false },
        successMessage: "Task paused successfully",
      });
      setIsDropdownOpen(false);
    } catch (error) {
      console.error("Failed to pause task:", error);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the edit dialog
    try {
      await deleteAction({
        actionId: task.id,
        successMessage: "Task deleted successfully",
      });
      setIsDropdownOpen(false);
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const statusLabel = isDeleted
    ? "Deleted"
    : isActive
      ? "Active"
      : isPaused
        ? "Paused"
        : null;

  const statusClasses = isDeleted
    ? "border-destructive/20 bg-destructive/10 text-destructive"
    : isActive
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      : "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400";

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-muted/60",
        isDeleted && "opacity-70",
      )}
    >
      <TaskArtistImage artistAccountId={task.artist_account_id} />

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex min-w-0 items-center gap-2">
          <h4 className="truncate text-sm font-semibold text-foreground">
            {task.title}
          </h4>
          {ownerEmail && (
            <span className="shrink-0 truncate rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {ownerEmail}
            </span>
          )}
        </div>

        <span className="inline-flex w-fit max-w-full items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">
          {isRecurring(task.schedule) ? (
            <Repeat className="size-3 shrink-0" />
          ) : (
            <Clock className="size-3 shrink-0" />
          )}
          <span className="truncate">
            {parseCronToHuman(task.schedule.trim())}
          </span>
        </span>
      </div>

      <div className="relative flex shrink-0 items-center justify-end gap-1">
        {/* Hover actions — only for non-deleted tasks */}
        {!isDeleted && (
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              aria-label="Edit task"
              className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Edit className="size-4" />
            </button>
            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Task options"
                  className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  onClick={(e) => e.stopPropagation()} // Prevent opening the edit dialog
                >
                  <MoreHorizontal className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem
                  className="flex items-center gap-2"
                  onClick={handlePause}
                  disabled={isUpdating || isDeleting}
                >
                  <Pause className="h-4 w-4" />
                  <span>{isUpdating ? "Pausing..." : "Pause"}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  onClick={handleDelete}
                  disabled={isUpdating || isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>{isDeleting ? "Deleting..." : "Delete"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Status pill — hidden on hover to reveal actions (deleted keeps showing) */}
        {statusLabel && (
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 text-xs font-medium",
              !isDeleted && "group-hover:hidden",
              statusClasses,
            )}
          >
            {statusLabel}
          </span>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
