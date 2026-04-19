"use client";

import { useCreateTaskFormContext } from "@/providers/CreateTaskFormProvider";
import { CreateTaskPageHeader } from "./CreateTaskPageHeader";
import { CreateTaskArtistField } from "./CreateTaskArtistField";
import { CreateTaskFormActions } from "./CreateTaskFormActions";
import { CreateTaskPromptField } from "./CreateTaskPromptField";
import { CreateTaskTitleField } from "./CreateTaskTitleField";
import { ModelField } from "./ModelField";
import { ScheduleField } from "./ScheduleField";

export function CreateTaskFormBody() {
  const { handleSubmit } = useCreateTaskFormContext();

  return (
    <>
      <CreateTaskPageHeader
        title="Create Task"
        description="Create a new scheduled task for an artist."
      />

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
        <CreateTaskTitleField />
        <CreateTaskPromptField />
        <ScheduleField />
        <CreateTaskArtistField />
        <ModelField />
        <CreateTaskFormActions />
      </form>
    </>
  );
}
