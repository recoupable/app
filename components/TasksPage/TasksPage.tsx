"use client";

import useAutoLogin from "@/hooks/useAutoLogin";
import Link from "next/link";
import TasksTabs from "./TasksTabs";
import { Button } from "@/components/ui/button";

const TasksPage = () => {
  useAutoLogin();

  return (
    <div className="max-w-full md:max-w-[calc(100vw-200px)] grow py-8 px-6 md:px-12">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-left font-heading text-3xl font-bold dark:text-white mb-4">
            Tasks
          </h1>
          <p className="text-lg text-muted-foreground text-left font-light font-sans max-w-2xl">
            View and manage all the tasks for your selected artist.
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/tasks/new">Create Task</Link>
        </Button>
      </div>

      <TasksTabs />
    </div>
  );
};

export default TasksPage;
