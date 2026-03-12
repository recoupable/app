import React from "react";
import { ListTodo, CheckCircle2 } from "lucide-react";
import { ScheduledAction } from "@/components/VercelChat/types";
import TaskCard from "./TaskCard";
import TaskDetailsDialog from "@/components/VercelChat/dialogs/tasks/TaskDetailsDialog";
import TaskError from "./TaskError";

export interface GetTasksSuccessProps {
  result: ScheduledAction[];
}

const GetTasksSuccess: React.FC<GetTasksSuccessProps> = ({ result: tasks }) => {
  if (!Array.isArray(tasks)) {
    return (
      <TaskError
        message="Failed to retrieve tasks"
        error={typeof tasks === "object" && tasks !== null ? JSON.stringify(tasks) : String(tasks ?? "Unknown error")}
        title="Task Retrieval Error"
      />
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm max-w-2xl">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border  bg-muted rounded-t-lg">
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400" />
          <h3 className="text-sm font-semibold text-foreground">Tasks</h3>
        </div>
        <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-1">
          Successfully retrieved tasks
        </p>
      </div>

      {/* Tasks List */}
      <div className="p-4">
        {tasks.length === 0 ? (
          <div className="text-center py-6">
            <ListTodo className="h-8 w-8 text-muted-foreground dark:text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No tasks found</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {tasks.map((task) => (
              <TaskDetailsDialog key={task.id} task={task}>
                <TaskCard task={task} />
              </TaskDetailsDialog>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GetTasksSuccess;
