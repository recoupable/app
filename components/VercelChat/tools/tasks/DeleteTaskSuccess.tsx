"use client";

import React from "react";
import { motion } from "framer-motion";
import { format, isValid } from "date-fns";
import { Trash2 } from "lucide-react";
import { ScheduledAction } from "@/components/VercelChat/types";
import { ToolCard } from "../shared/ToolCard";
import { ToolEmpty } from "../shared/ToolEmpty";
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
      <TaskError error="The task couldn't be deleted. Please try again." />
    );
  }

  // Show the future that was cancelled — makes the deletion legible.
  const nextRunDate = task.next_run ? new Date(task.next_run) : null;
  const nextRunValid = nextRunDate && isValid(nextRunDate);
  const cancelledRun = nextRunValid
    ? `Was: ${format(nextRunDate as Date, "EEE 'at' h:mm a")}`
    : null;

  // Success state
  return (
    <ToolCard
      icon={Trash2}
      tone="warning"
      title="Task deleted"
      subtitle="This task has been removed and will no longer run."
    >
      {task.id ? (
        <div className="space-y-1.5 p-1.5">
          {/* Removal "settle": the row desaturates and eases down on mount. */}
          <motion.div
            initial={{ opacity: 1, filter: "grayscale(0)", y: -2 }}
            animate={{ opacity: 0.7, filter: "grayscale(0.6)", y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <TaskDetailsDialog task={task} isDeleted={true}>
              <TaskCard task={task} isDeleted={true} />
            </TaskDetailsDialog>
          </motion.div>
          {cancelledRun && (
            <p className="px-3 text-xs text-muted-foreground">
              <span className="line-through">{cancelledRun}</span>
            </p>
          )}
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
