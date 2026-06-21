import React from "react";
import { ScheduledAction } from "@/components/VercelChat/types";
import TaskCard from "./TaskCard";
import TaskError from "./TaskError";
import { CalendarClock, Plus } from "lucide-react";
import { ToolCard } from "../shared/ToolCard";
import ToolEmpty from "../shared/ToolEmpty";
import TaskDetailsDialog from "../../dialogs/tasks/TaskDetailsDialog";

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
    <ToolCard
      icon={Plus}
      tone="success"
      emphasized
      title="Task created"
      subtitle="Your task is scheduled and ready to run."
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
          description="The task was created but no details were returned."
        />
      )}
    </ToolCard>
  );
};

export default CreateTaskSuccess;
