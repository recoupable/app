import { Task } from "@/lib/tasks/getTasks";
import TaskCard from "@/components/VercelChat/tools/tasks/TaskCard";
import TaskSkeleton from "./TaskSkeleton";
import Link from "next/link";
import { getTaskHref } from "@/lib/tasks/getTaskHref";
import { useUserProvider } from "@/providers/UserProvder";

interface TasksListProps {
  tasks: Task[];
  isLoading: boolean;
  isError: boolean;
}

const TasksList: React.FC<TasksListProps> = ({ tasks, isLoading, isError }) => {
  const { userData } = useUserProvider();

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
          You have no scheduled tasks yet.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {tasks.map((task: Task, index) => (
        <Link
          key={task.id}
          href={getTaskHref(task.id)}
          className={
            index !== tasks.length - 1
              ? "block border-b border-border"
              : "block"
          }
        >
          <TaskCard
            task={task}
            ownerEmail={task.owner_email ?? undefined}
            artistName={task.artist_name}
          />
        </Link>
      ))}
    </div>
  );
};

export default TasksList;
