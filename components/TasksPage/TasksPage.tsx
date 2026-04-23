"use client";

import useAutoLogin from "@/hooks/useAutoLogin";
import TasksTabs from "./TasksTabs";
import { TasksPageHeader } from "./TasksPageHeader";

const TasksPage = () => {
  useAutoLogin();

  return (
    <div className="max-w-full md:max-w-[calc(100vw-200px)] grow py-8 px-6 md:px-12">
      <TasksPageHeader />
      <TasksTabs />
    </div>
  );
};

export default TasksPage;
