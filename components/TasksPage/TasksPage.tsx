"use client";

import { useArtistProvider } from "@/providers/ArtistProvider";
import { useScheduledActions } from "@/hooks/useScheduledActions";
import { useTaskRuns } from "@/hooks/useTaskRuns";
import TasksList from "./TasksList";
import RecentRunsList from "./RecentRunsList";
import PulseHeader from "@/components/Pulse/PulseHeader";
import useAutoLogin from "@/hooks/useAutoLogin";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const TasksPage = () => {
  useAutoLogin();
  const { selectedArtist } = useArtistProvider();
  const artistAccountId = selectedArtist?.account_id as string | undefined;
  const { data, isLoading, isError } = useScheduledActions({
    artistAccountId,
  });
  const {
    data: taskRuns,
    isLoading: isRunsLoading,
    isError: isRunsError,
  } = useTaskRuns();

  const tasks = data ?? [];
  const runs = taskRuns ?? [];

  return (
    <div className="max-w-full md:max-w-[calc(100vw-200px)] grow py-8 px-6 md:px-12">
      <h1 className="text-left font-heading text-3xl font-bold dark:text-white mb-4">
        Tasks
      </h1>
      <p className="text-lg text-muted-foreground text-left mb-6 font-light font-sans max-w-2xl">
        View and manage all the tasks for your selected artist.
      </p>

      <Tabs defaultValue="schedule" className="max-w-2xl">
        <TabsList>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="pulse">Pulse</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule">
          <TasksList tasks={tasks} isLoading={isLoading} isError={isError} />
        </TabsContent>

        <TabsContent value="recent">
          <div className="mt-4">
            <RecentRunsList
              runs={runs}
              isLoading={isRunsLoading}
              isError={isRunsError}
            />
          </div>
        </TabsContent>

        <TabsContent value="pulse">
          <div className="mt-4">
            <PulseHeader />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TasksPage;
