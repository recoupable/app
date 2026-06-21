import React from "react";
import { Trash2 } from "lucide-react";
import { ScheduledAction } from "@/components/VercelChat/types";
import { ToolCard } from "../shared/ToolCard";
import ToolEmpty from "../shared/ToolEmpty";
import TaskCard from "./TaskCard";
import TaskError from "./TaskError";
import TaskDetailsDialog from "../../dialogs/tasks/TaskDetailsDialog";

export interface DeleteTaskSuccessProps {
  result: ScheduledAction;
}

const DeleteTaskSuccess: React.FC<DeleteTaskSuccessProps> = ({
  result: task,
}) => {
  // Error state
  if (!task) {
    return (
      <TaskError
        message="Failed to Delete Task"
        error="Failed to Delete Task"
        title="Failed to Delete Task"
      />
    );
  }

  // Success state
  return (
    <ToolCard
      icon={Trash2}
      tone="warning"
      title="Task deleted"
      subtitle="This task has been removed and will no longer run."
    >
      {task.id ? (
        <div className="p-1.5">
          <TaskDetailsDialog task={task} isDeleted={true}>
            <TaskCard task={task} isDeleted={true} />
          </TaskDetailsDialog>
        </div>
      ) : (
        <ToolEmpty
          icon={Trash2}
          title="No tasks were deleted"
          description="The delete completed but no details were returned."
        />
      )}
    </ToolCard>
  );
};

export default DeleteTaskSuccess;
