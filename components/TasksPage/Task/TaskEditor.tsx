"use client";

import { useRouter } from "next/navigation";
import type { Task } from "@/lib/tasks/getTasks";
import { useTaskEditState } from "@/hooks/useTaskEditState";
import TaskDetails from "./TaskDetails";
import TaskActions from "./TaskActions";

/** Edit form + actions for a loaded task; a delete returns to the list. */
export default function TaskEditor({ task }: { task: Task }) {
  const router = useRouter();
  const edit = useTaskEditState(task);

  return (
    <>
      <TaskDetails
        task={task}
        editTitle={edit.editTitle}
        editPrompt={edit.editPrompt}
        editCron={edit.editCron}
        editModel={edit.editModel}
        editTimezone={edit.editTimezone}
        onTitleChange={edit.setEditTitle}
        onPromptChange={edit.setEditPrompt}
        onCronChange={edit.setEditCron}
        onModelChange={edit.setEditModel}
        onTimezoneChange={edit.setEditTimezone}
      />
      <TaskActions
        taskId={task.id}
        editTitle={edit.editTitle}
        editPrompt={edit.editPrompt}
        editCron={edit.editCron}
        editModel={edit.editModel}
        editTimezone={edit.editTimezone}
        isEnabled={!!task.enabled}
        onDeleteSuccess={() => router.push("/tasks")}
      />
    </>
  );
}
