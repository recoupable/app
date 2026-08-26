import React from "react";
import { ScheduledAction } from "@/components/VercelChat/types";
import TaskCard from "./TaskCard";
import TaskError from "./TaskError";
import { CheckCircle, Calendar } from "lucide-react";
import Link from "next/link";
import { getTaskHref } from "@/lib/tasks/getTaskHref";

interface CreateTaskSuccessProps {
  result: ScheduledAction;
}

const CreateTaskSuccess: React.FC<CreateTaskSuccessProps> = ({
  result: task,
}) => {
  // Error state
  if (!task) {
    return (
      <TaskError
        message="Failed to Create Task"
        error="Failed to Create Task"
        title="Failed to Create Task"
      />
    );
  }

  // Success state
  return (
    <div className="bg-card border border-border rounded-xl p-4 max-w-2xl shadow-sm">
      {/* Success Header */}
      <div className="flex items-start space-x-3 mb-4">
        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-foreground flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Task created successfully</span>
          </h3>
        </div>
      </div>

      {/* Task Card */}
      {task && task.id && (
        <div className="space-y-3">
          <Link href={getTaskHref(task.id)} className="block">
            <TaskCard task={task} />
          </Link>
        </div>
      )}

      {/* Empty state (shouldn't happen in success, but just in case) */}
      {(!task || !task.id) && (
        <div className="text-center py-4">
          <Calendar className="h-8 w-8 text-green-400 mx-auto mb-2" />
          <p className="text-sm text-green-600">No task to display</p>
        </div>
      )}
    </div>
  );
};

export default CreateTaskSuccess;
