import type { TaskRunItem } from "@/lib/tasks/getTaskRuns";
import RunCard from "./RunCard";
import TaskSkeleton from "./TaskSkeleton";

interface RecentRunsListProps {
  runs: TaskRunItem[];
  isLoading: boolean;
  isError: boolean;
  accountId?: string;
}

const RecentRunsList: React.FC<RecentRunsListProps> = ({
  runs,
  isLoading,
  isError,
  accountId,
}) => {
  if (isError) {
    return (
      <div className="text-sm text-red-600 dark:text-red-400">
        Failed to load recent runs
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <TaskSkeleton />
        <TaskSkeleton />
        <TaskSkeleton />
      </div>
    );
  }

  if (runs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No recent task runs.</p>
      </div>
    );
  }

  return (
    <div>
      {runs.map((run, index) => (
        <div
          key={run.id}
          className={index !== runs.length - 1 ? "border-b border-border" : ""}
        >
          <RunCard run={run} accountId={accountId} />
        </div>
      ))}
    </div>
  );
};

export default RecentRunsList;
