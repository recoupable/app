import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Repeat,
  MoreHorizontal,
  Pause,
  Trash2,
  Clock,
  CalendarClock,
} from "lucide-react";
import { format, formatDistanceToNow, isValid } from "date-fns";
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

/**
 * Render the human schedule without ever leaking a raw cron string into the UI.
 * cronstrue (via parseCronToHuman) returns the original expression on failure,
 * so we detect that and degrade to a friendly, neutral label instead.
 */
const friendlySchedule = (schedule: string): string => {
  const trimmed = schedule.trim();
  const human = parseCronToHuman(trimmed);
  // parseCronToHuman returns the input verbatim when parsing fails.
  if (human === trimmed) return "Custom schedule";
  return human;
};

const TaskCard: React.FC<TaskCardProps> = ({ task, isDeleted, ownerEmail }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { updateAction, isLoading: isUpdating } = useUpdateScheduledAction();
  const { deleteAction, isLoading: isDeleting } = useDeleteScheduledAction();
  const isActive = task.enabled && !isDeleted;
  const isPaused = !task.enabled && !isDeleted;

  const handlePause = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the edit dialog
    await updateAction({
      updates: { id: task.id, enabled: false },
      successMessage: "Task paused successfully",
    });
    setIsDropdownOpen(false);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the edit dialog
    await deleteAction({
      actionId: task.id,
      successMessage: "Task deleted successfully",
    });
    setIsDropdownOpen(false);
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

  const recurring = isRecurring(task.schedule);
  const scheduleLabel = friendlySchedule(task.schedule);

  // Next-run: the scheduler's core trust signal. Guard hard — the field is
  // nullable and may hold an unparseable value.
  const nextRunDate = task.next_run ? new Date(task.next_run) : null;
  const nextRunValid = nextRunDate && isValid(nextRunDate);
  // Only surface a future run on tasks that will actually fire.
  const showNextRun =
    nextRunValid && isActive && (nextRunDate as Date).getTime() > Date.now();

  const nextRunRelative = showNextRun
    ? formatDistanceToNow(nextRunDate as Date, { addSuffix: true })
    : null;
  const nextRunAbsolute = nextRunValid
    ? format(nextRunDate as Date, "EEE, MMM d 'at' h:mm a")
    : null;

  return (
    <motion.div
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-muted/60",
        isDeleted && "opacity-70",
      )}
      animate={
        isDeleted
          ? { opacity: 0.7 }
          : isUpdating || isDeleting
            ? { opacity: 0.55 }
            : { opacity: 1 }
      }
      transition={{ duration: 0.2 }}
    >
      <TaskArtistImage artistAccountId={task.artist_account_id} />

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex min-w-0 items-center gap-2">
          <h4
            className={cn(
              "truncate text-sm font-semibold text-foreground",
              isDeleted && "line-through decoration-destructive/50",
            )}
          >
            {task.title}
          </h4>
          {ownerEmail && (
            <span className="shrink-0 truncate rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {ownerEmail}
            </span>
          )}
        </div>

        {/* Schedule on its own line — the most important fact shouldn't truncate first. */}
        <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
          {recurring ? (
            <Repeat className="size-3 shrink-0" />
          ) : (
            <Clock className="size-3 shrink-0" />
          )}
          <span className="truncate" title={scheduleLabel}>
            {scheduleLabel}
          </span>
        </div>

        {/* Next-run line — concrete moment builds trust in the scheduler. */}
        {nextRunRelative && (
          <div
            className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-foreground/80"
            title={nextRunAbsolute ?? undefined}
          >
            <CalendarClock className="size-3 shrink-0 text-foreground/60" />
            <span className="truncate">Next run {nextRunRelative}</span>
          </div>
        )}
      </div>

      <div className="relative flex shrink-0 items-center justify-end gap-1">
        {/* Hover actions — never exposed on deleted tasks. */}
        {!isDeleted && (
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <DropdownMenu
                open={isDropdownOpen}
                onOpenChange={setIsDropdownOpen}
              >
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
                    disabled={isUpdating || isDeleting || !task.enabled}
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

        {/* Status pill — stays visible; actions sit beside it rather than replacing it. */}
        {statusLabel && (
          <motion.span
            layout
            className={cn(
              "rounded-full border px-2 py-0.5 text-xs font-medium",
              statusClasses,
            )}
          >
            {statusLabel}
          </motion.span>
        )}
      </div>
    </motion.div>
  );
};

export default TaskCard;
