"use client";

import { CreateTaskButton } from "./CreateTaskButton";

export function TasksPageHeader() {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-left font-heading text-3xl font-bold dark:text-white mb-4">
          Tasks
        </h1>
        <p className="text-lg text-muted-foreground text-left font-light font-sans max-w-2xl">
          View and manage all the tasks for your selected artist.
        </p>
      </div>
      <CreateTaskButton />
    </div>
  );
}
