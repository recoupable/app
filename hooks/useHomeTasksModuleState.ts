import { useTaskRuns } from "@/hooks/useTaskRuns";
import { useArtistProvider } from "@/providers/ArtistProvider";
import {
  getHomeTasksModuleState,
  HomeTasksModuleState,
} from "@/lib/home/getHomeTasksModuleState";

/**
 * Composed hook behind the homepage tasks module. Shared by `TasksModule`
 * and `HomePage` (which needs the visibility to dock the command bar);
 * react-query dedupes the underlying `GET /api/tasks/runs` by key.
 */
const useHomeTasksModuleState = (): HomeTasksModuleState => {
  const { data: runs, isLoading, isError } = useTaskRuns();
  const { selectedArtist } = useArtistProvider();

  return getHomeTasksModuleState({
    runs,
    runsFailed: isError,
    isLoading,
    hasArtist: !!selectedArtist?.account_id,
  });
};

export default useHomeTasksModuleState;
