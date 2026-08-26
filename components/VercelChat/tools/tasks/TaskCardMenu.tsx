import React, { useState } from "react";
import { MoreHorizontal, Pause, Trash2 } from "lucide-react";
import { useUpdateScheduledAction } from "@/hooks/useUpdateScheduledAction";
import { useDeleteScheduledAction } from "@/hooks/useDeleteScheduledAction";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Pause / Delete menu on a task card. The card sits inside a link to the task page, so menu clicks must not navigate. */
const TaskCardMenu = ({ taskId }: { taskId: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { updateAction, isLoading: isUpdating } = useUpdateScheduledAction();
  const { deleteAction, isLoading: isDeleting } = useDeleteScheduledAction();

  const stayOnPage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handlePause = async (e: React.MouseEvent) => {
    stayOnPage(e);
    try {
      await updateAction({
        updates: { id: taskId, enabled: false },
        successMessage: "Task paused successfully",
      });
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to pause task:", error);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    stayOnPage(e);
    try {
      await deleteAction({
        actionId: taskId,
        successMessage: "Task deleted successfully",
      });
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <div
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={stayOnPage}
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
  );
};

export default TaskCardMenu;
