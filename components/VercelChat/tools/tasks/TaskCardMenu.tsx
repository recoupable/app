import React, { useState } from "react";
import { MoreHorizontal, Pause, Trash2 } from "lucide-react";
import { useUpdateScheduledAction } from "@/hooks/useUpdateScheduledAction";
import { useDeleteScheduledAction } from "@/hooks/useDeleteScheduledAction";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TaskCardMenuProps {
  taskId: string;
  taskTitle: string;
  enabled: boolean;
}

/** Task actions are siblings of navigation; mutation hooks report failures. */
const TaskCardMenu = ({ taskId, taskTitle, enabled }: TaskCardMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { updateAction, isLoading: isUpdating } = useUpdateScheduledAction();
  const { deleteAction, isLoading: isDeleting } = useDeleteScheduledAction();

  const keepMenuOpen = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handlePause = async (e: Event) => {
    keepMenuOpen(e);
    try {
      await updateAction({
        updates: { id: taskId, enabled: false },
        successMessage: "Task paused successfully",
      });
      setIsOpen(false);
    } catch {
      // Keep the menu open for retry after the mutation hook reports failure.
    }
  };

  const handleDelete = async (e: Event) => {
    keepMenuOpen(e);
    try {
      await deleteAction({
        actionId: taskId,
        successMessage: "Task deleted successfully",
      });
      setIsOpen(false);
    } catch {
      // Keep the menu open for retry after the mutation hook reports failure.
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Task options for ${taskTitle}`}
          className="h-11 w-11 shrink-0 text-muted-foreground"
        >
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        <DropdownMenuItem
          className="flex items-center gap-2"
          onSelect={handlePause}
          disabled={isUpdating || isDeleting || !enabled}
        >
          <Pause className="h-4 w-4" />
          <span>{isUpdating ? "Pausing..." : "Pause"}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
          onSelect={handleDelete}
          disabled={isUpdating || isDeleting}
        >
          <Trash2 className="h-4 w-4" />
          <span>{isDeleting ? "Deleting..." : "Delete"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TaskCardMenu;
