import { useTaskRuns } from "@/hooks/useTaskRuns";
import { useScheduledActions } from "@/hooks/useScheduledActions";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { findExistingWeeklyReportTask } from "@/lib/onboarding/findExistingWeeklyReportTask";
import {
  getHomeTasksModuleState,
  HomeTasksModuleState,
} from "@/lib/home/getHomeTasksModuleState";

/**
 * Composed hook behind the homepage tasks module. Shared by `TasksModule`
 * and `HomePage` (which needs the visibility to dock the command bar);
 * react-query dedupes the underlying `GET /api/tasks/runs` and
 * `GET /api/tasks` reads by key. The tasks read gates the starter card so
 * an account with an enabled report is never offered a duplicate.
 */
const useHomeTasksModuleState = (): HomeTasksModuleState => {
  const { data: runs, isLoading, isError } = useTaskRuns();
  const tasksQuery = useScheduledActions({});
  const { selectedArtist } = useArtistProvider();

  return getHomeTasksModuleState({
    runs,
    runsFailed: isError,
    isLoading: isLoading || tasksQuery.isLoading,
    hasArtist: !!selectedArtist?.account_id,
    // isSuccess, not data: react-query keeps the last list around after a
    // failed refetch, and an unknown task list must hide the starter.
    existingTask: tasksQuery.isSuccess
      ? findExistingWeeklyReportTask(tasksQuery.data)
      : undefined,
  });
};

export default useHomeTasksModuleState;
