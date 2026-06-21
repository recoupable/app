import React from "react";
import { ListTodo } from "lucide-react";
import { ScheduledAction } from "@/components/VercelChat/types";
import { ToolCard } from "../shared/ToolCard";
import { ToolEmpty } from "../shared/ToolEmpty";
import TaskCard from "./TaskCard";
import TaskDetailsDialog from "@/components/VercelChat/dialogs/tasks/TaskDetailsDialog";

export interface GetTasksSuccessProps {
  result: ScheduledAction[];
}

const GetTasksSuccess: React.FC<GetTasksSuccessProps> = ({ result: tasks }) => {
  const count = tasks?.length ?? 0;
  const isEmpty = count === 0;

  return (
    <ToolCard
      icon={ListTodo}
      tone="info"
      title="Tasks"
      subtitle={
        isEmpty
          ? "No scheduled tasks"
          : `${count} scheduled ${count === 1 ? "task" : "tasks"}`
      }
      trailing={
        isEmpty ? undefined : (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {count}
          </span>
        )
      }
    >
      {isEmpty ? (
        <ToolEmpty
          icon={ListTodo}
          title="No tasks found"
          description="Scheduled tasks you create will appear here."
        />
      ) : (
        <div className="max-h-80 divide-y divide-border/60 overflow-y-auto p-1.5">
          {tasks.map((task) => (
            <TaskDetailsDialog key={task.id} task={task}>
              <TaskCard task={task} />
            </TaskDetailsDialog>
          ))}
        </div>
      )}
    </ToolCard>
  );
};

export default GetTasksSuccess;
