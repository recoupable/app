"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useUpdateScheduledAction } from "@/hooks/useUpdateScheduledAction";
import { useDeleteScheduledAction } from "@/hooks/useDeleteScheduledAction";

export interface TaskDetailsDialogActionButtonsProps {
  taskId: string;
  editTitle: string;
  editPrompt: string;
  editCron: string;
  editModel: string;
  onSaveSuccess: () => void;
  onDeleteSuccess: () => void;
  isEnabled: boolean;
  canEdit: boolean;
}

export function useTaskDetailsDialogActionButtons({
  taskId,
  editTitle,
  editPrompt,
  editCron,
  editModel,
  onSaveSuccess,
  onDeleteSuccess,
  isEnabled,
  canEdit,
}: TaskDetailsDialogActionButtonsProps) {
  const { authenticated } = usePrivy();
  const { updateAction, isLoading: isUpdating } = useUpdateScheduledAction();
  const { deleteAction, isLoading: isDeleting } = useDeleteScheduledAction();
  const isLoading = isUpdating || isDeleting;

  const handlePause = async () => {
    if (!canEdit) return;
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
    if (!canEdit) return;
    try {
      await deleteAction({
        actionId: taskId,
        onSuccess: () => onDeleteSuccess(),
      });
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const handleSave = async () => {
    if (!canEdit) return;
    try {
      await updateAction({
        updates: {
          id: taskId,
          title: editTitle,
          prompt: editPrompt,
          schedule: editCron.trim(),
          model: editModel,
        },
        onSuccess: () => onSaveSuccess(),
        successMessage: "Task updated successfully",
      });
    } catch (error) {
      console.error("Failed to save task:", error);
    }
  };

  return {
    authenticated,
    handleDelete,
    handlePause,
    handleSave,
    isLoading,
  };
}
