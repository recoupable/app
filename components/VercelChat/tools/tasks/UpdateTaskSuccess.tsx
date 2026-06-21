import React from "react";
import TaskCard from "./TaskCard";
import { CalendarClock, Pencil } from "lucide-react";
import { ToolCard } from "../shared/ToolCard";
import ToolEmpty from "../shared/ToolEmpty";
import TaskDetailsDialog from "@/components/VercelChat/dialogs/tasks/TaskDetailsDialog";
import { ScheduledAction } from "@/components/VercelChat/types";
import TaskError from "./TaskError";

const UpdateTaskSuccess = ({ result: task }: { result: ScheduledAction }) => {
  // Error state
  if (!task) {
    return (
      <TaskError
        message="Failed to Update Task"
        error="Failed to Update Task"
        title="Failed to Update Task"
      />
    );
  }

  // Success state
  return (
    <ToolCard
      icon={Pencil}
      tone="info"
      emphasized
      title="Task updated"
      subtitle="Your changes have been saved."
    >
      {task.id ? (
        <div className="p-1.5">
          <TaskDetailsDialog task={task}>
            <TaskCard task={task} />
          </TaskDetailsDialog>
        </div>
      ) : (
        <ToolEmpty
          icon={CalendarClock}
          title="No task to display"
          description="The task was updated but no details were returned."
        />
      )}
    </ToolCard>
  );
};

export default UpdateTaskSuccess;
