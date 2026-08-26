import { useState } from "react";
import { Tables } from "@/types/database.types";
import { DEFAULT_MODEL } from "@/lib/consts";
import { getTaskTimezone } from "@/lib/timezone/getTaskTimezone";

/**
 * Draft values for the task page's edit form, seeded from the task. The
 * caller keys its component on the task's `updated_at` so a refetch after
 * Save or Pause re-seeds the drafts.
 */
export const useTaskEditState = (task: Tables<"scheduled_actions">) => {
  const [editTitle, setEditTitle] = useState(task.title);
  const [editPrompt, setEditPrompt] = useState(task.prompt);
  const [editCron, setEditCron] = useState(
    task.schedule?.trim() || "0 9 * * *",
  );
  const [editModel, setEditModel] = useState(task.model || DEFAULT_MODEL);
  const [editTimezone, setEditTimezone] = useState(() => getTaskTimezone(task));

  return {
    editTitle,
    setEditTitle,
    editPrompt,
    setEditPrompt,
    editCron,
    setEditCron,
    editModel,
    setEditModel,
    editTimezone,
    setEditTimezone,
  };
};
