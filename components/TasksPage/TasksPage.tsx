"use client";

import useAutoLogin from "@/hooks/useAutoLogin";
import TasksTabs from "./TasksTabs";

const TasksPage = () => {
  useAutoLogin();

  return (
    <div className="max-w-full md:max-w-[calc(100vw-200px)] grow py-8 px-6 md:px-12">
      <h1 className="text-left font-heading text-3xl font-bold dark:text-white mb-4">
        Tasks
      </h1>
      <p className="text-lg text-muted-foreground text-left mb-6 font-light font-sans max-w-2xl">
        View and manage all the tasks for your selected artist.
      </p>

      <TasksTabs />
    </div>
  );
};

export default TasksPage;
