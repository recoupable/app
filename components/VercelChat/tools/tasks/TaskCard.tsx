import React, { useState } from "react";
import { Edit, Repeat, MoreHorizontal, Pause, Trash2 } from "lucide-react";
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

  return (
    <div
      className={cn(
        `group flex items-center justify-between py-4 px-4 hover:bg-muted dark:hover:bg-[#1a1a1a] transition-colors -mx-4`,
        {
          "opacity-70": isDeleted,
        }
      )}
    >
      <div className="flex items-center space-x-4">
        <TaskArtistImage artistAccountId={task.artist_account_id} />
        <div className="flex items-center gap-2">
          <h4 className="text-base font-medium text-foreground">{task.title}</h4>
          {ownerEmail && (
            <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full">
              {ownerEmail}
            </span>
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
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <div
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()} // Prevent opening the edit dialog
              >
                <MoreHorizontal className="h-5 w-5 text-muted-foreground dark:text-muted-foreground hover:text-muted-foreground dark:hover:text-muted-foreground cursor-pointer" />
              </div>
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
