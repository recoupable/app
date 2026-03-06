"use client";

import { useArtistProvider } from "@/providers/ArtistProvider";
import { useScheduledActions } from "@/hooks/useScheduledActions";
import TasksList from "./TasksList";
import useAutoLogin from "@/hooks/useAutoLogin";

const TasksPage = () => {
  useAutoLogin();
  const { selectedArtist } = useArtistProvider();
  const artistAccountId = selectedArtist?.account_id as string | undefined;
  const { data, isLoading, isError } = useScheduledActions({
    artistAccountId,
  });

  const tasks = data ?? [];

  return (
    <div className="max-w-full md:max-w-[calc(100vw-200px)] grow py-8 px-6 md:px-12">
      <h1 className="text-left font-heading text-3xl font-bold dark:text-white mb-4">
        Tasks
      </h1>
      <p className="text-lg text-muted-foreground text-left mb-4 font-light font-sans max-w-2xl">
        View and manage all the tasks for your selected artist.
      </p>

      <TasksList tasks={tasks} isLoading={isLoading} isError={isError} />
    </div>
  );
};

export default TasksPage;
