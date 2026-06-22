import { FC } from "react";
import { ListTodo } from "lucide-react";
import { ToolCardSkeleton } from "@/components/VercelChat/tools/shared/ToolCardSkeleton";

export interface TasksSkeletonProps {
  numberOfTasks?: number;
}

const TasksSkeleton: FC<TasksSkeletonProps> = ({ numberOfTasks = 2 }) => {
  return (
    <ToolCardSkeleton
      icon={ListTodo}
      label="Loading tasks"
      rows={numberOfTasks}
    />
  );
};

export default TasksSkeleton;
