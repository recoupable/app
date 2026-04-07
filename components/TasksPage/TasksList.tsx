import { Task } from "@/lib/tasks/getTasks";
import TaskCard from "@/components/VercelChat/tools/tasks/TaskCard";
import TaskSkeleton from "./TaskSkeleton";
import TaskDetailsDialog from "@/components/VercelChat/dialogs/tasks/TaskDetailsDialog";
import { useUserProvider } from "@/providers/UserProvder";
import { useMemo } from "react";
import { useAccountEmails } from "@/hooks/useAccountEmails";

interface TasksListProps {
  tasks: Task[];
  isLoading: boolean;
  isError: boolean;
}

const TasksList: React.FC<TasksListProps> = ({ tasks, isLoading, isError }) => {
  const { userData } = useUserProvider();

  // Extract unique account IDs from tasks
  const accountIds = useMemo(
    () => [...new Set(tasks.map((task) => task.account_id))],
    [tasks],
  );

  // Batch fetch emails for all task owners
  const { data: accountEmails = [] } = useAccountEmails({
    accountIds,
  });

  // Create lookup map for O(1) email access
  const emailByAccountId = useMemo(() => {
    const map = new Map<string, string>();
    accountEmails.forEach((ae) => {
      if (ae.account_id && ae.email) {
        map.set(ae.account_id, ae.email);
      }
    });
    return map;
  }, [accountEmails]);

  if (isError) {
    return (
      <div className="text-sm text-red-600 dark:text-red-400">
        Failed to load tasks
      </div>
    );
  }

  if (isLoading || !userData) {
    return (
      <div className="space-y-4">
        <TaskSkeleton />
        <TaskSkeleton />
        <TaskSkeleton />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          You have no scheduled tasks for this artist.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {tasks.map((task: Task, index) => (
        <TaskDetailsDialog key={task.id} task={task}>
          <div
            className={
              index !== tasks.length - 1 ? "border-b border-border " : ""
            }
          >
            <TaskCard
              task={task}
              ownerEmail={emailByAccountId.get(task.account_id)}
            />
          </div>
        </TaskDetailsDialog>
      ))}
    </div>
  );
};

export default TasksList;
