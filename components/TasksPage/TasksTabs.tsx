"use client";

import { useArtistProvider } from "@/providers/ArtistProvider";
import { useScheduledActions } from "@/hooks/useScheduledActions";
import { useTaskRuns } from "@/hooks/useTaskRuns";
import TasksList from "./TasksList";
import RecentRunsList from "./RecentRunsList";
import PulseHeader from "@/components/Pulse/PulseHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const TasksTabs = () => {
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
  );
};

export default TasksTabs;
