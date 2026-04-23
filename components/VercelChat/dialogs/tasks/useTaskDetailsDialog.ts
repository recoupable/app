import { useState, useEffect } from "react";
import { Tables } from "@/types/database.types";
import { DEFAULT_MODEL } from "@/lib/consts";

interface UseTaskDetailsDialogParams {
  task: Tables<"scheduled_actions">;
  isDeleted?: boolean;
}

export const useTaskDetailsDialog = ({
  task,
  isDeleted = false,
}: UseTaskDetailsDialogParams) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editPrompt, setEditPrompt] = useState(task.prompt);
  const [editCron, setEditCron] = useState(
    task.schedule?.trim() || "0 9 * * *"
  );
  const [editModel, setEditModel] = useState(task.model || DEFAULT_MODEL);

  // Sync edit state when task prop changes
  useEffect(() => {
    setEditTitle(task.title);
    setEditPrompt(task.prompt);
    setEditCron(task.schedule?.trim() || "0 9 * * *");
    setEditModel(task.model || DEFAULT_MODEL);
  }, [task]);

  const isActive = Boolean(task.enabled && !isDeleted);
  const isPaused = Boolean(!task.enabled && !isDeleted);
  const canEdit = !isDeleted;

  return {
    isDialogOpen,
    setIsDialogOpen,
    editTitle,
    setEditTitle,
    editPrompt,
    setEditPrompt,
    editCron,
    setEditCron,
    editModel,
    setEditModel,
    isActive,
    isPaused,
    canEdit,
  };
};
