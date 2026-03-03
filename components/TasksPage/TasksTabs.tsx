"use client";

import { useSearchParams } from "next/navigation";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { useScheduledActions } from "@/hooks/useScheduledActions";
import { useTaskRuns } from "@/hooks/useTaskRuns";
import TasksList from "./TasksList";
import RecentRunsList from "./RecentRunsList";
import PulseHeader from "@/components/Pulse/PulseHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const VALID_TABS = ["schedules", "recents", "pulses"];

const TasksTabs = () => {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const defaultTab = tabParam && VALID_TABS.includes(tabParam) ? tabParam : "schedules";
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
    <Tabs defaultValue={defaultTab} className="max-w-2xl">
      <TabsList>
        <TabsTrigger value="schedules">Schedules</TabsTrigger>
        <TabsTrigger value="recents">Recents</TabsTrigger>
        <TabsTrigger value="pulses">Pulses</TabsTrigger>
      </TabsList>

      <TabsContent value="schedules">
        <TasksList tasks={tasks} isLoading={isLoading} isError={isError} />
      </TabsContent>

      <TabsContent value="recents">
        <div className="mt-4">
          <RecentRunsList
            runs={runs}
            isLoading={isRunsLoading}
            isError={isRunsError}
          />
        </div>
      </TabsContent>

      <TabsContent value="pulses">
        <div className="mt-4">
          <PulseHeader />
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default TasksTabs;
