"use client";

import { Button } from "@/components/ui/button";
import { Pause, Trash2 } from "lucide-react";
import { useUpdateScheduledAction } from "@/hooks/useUpdateScheduledAction";
import { useDeleteScheduledAction } from "@/hooks/useDeleteScheduledAction";

interface TaskActionsProps {
  taskId: string;
  editTitle: string;
  editPrompt: string;
  editCron: string;
  editModel: string;
  editTimezone: string;
  isEnabled: boolean;
  onDeleteSuccess: () => void;
}

/** Save / Pause-Resume / Delete for the task page. */
const TaskActions: React.FC<TaskActionsProps> = ({
  taskId,
  editTitle,
  editPrompt,
  editCron,
  editModel,
  editTimezone,
  isEnabled,
  onDeleteSuccess,
}) => {
  const { updateAction, isLoading: isUpdating } = useUpdateScheduledAction();
  const { deleteAction, isLoading: isDeleting } = useDeleteScheduledAction();
  const isLoading = isUpdating || isDeleting;

  const handlePause = async () => {
    try {
      await updateAction({
        updates: { id: taskId, enabled: !isEnabled },
        successMessage: isEnabled ? "Task paused" : "Task activated",
      });
    } catch (error) {
      console.error("Failed to toggle task status:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAction({ actionId: taskId, onSuccess: onDeleteSuccess });
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const handleSave = async () => {
    try {
      await updateAction({
        updates: {
          id: taskId,
          title: editTitle,
          prompt: editPrompt,
          schedule: editCron.trim(),
          model: editModel,
          timezone: editTimezone,
        },
        successMessage: "Task updated successfully",
      });
    } catch (error) {
      console.error("Failed to save task:", error);
    }
  };

  return (
    <div className="flex gap-2 mt-4 pt-4 border-t border-border justify-between shrink-0">
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={handlePause}
          disabled={isLoading}
          size="sm"
        >
          <Pause className="h-4 w-4 mr-2" />
          {isEnabled ? "Pause" : "Resume"}
        </Button>
        <Button
          variant="outline"
          onClick={handleDelete}
          className="border-red-200 text-red-600 hover:bg-red-50"
          disabled={isLoading}
          size="sm"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
      <Button onClick={handleSave} disabled={isLoading} size="sm">
        {isLoading ? "Saving..." : "Save"}
      </Button>
    </div>
  );
};

export default TaskActions;
