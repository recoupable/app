"use client";

import React from "react";
import { motion } from "framer-motion";
import { format, formatDistanceToNow, isValid } from "date-fns";
import TaskCard from "./TaskCard";
import { CalendarClock, PencilLine } from "lucide-react";
import { ToolCard } from "../shared/ToolCard";
import { ToolEmpty } from "../shared/ToolEmpty";
import TaskDetailsDialog from "@/components/VercelChat/dialogs/tasks/TaskDetailsDialog";
import { ScheduledAction } from "@/components/VercelChat/types";
import TaskError from "./TaskError";

const UpdateTaskSuccess = ({ result: task }: { result: ScheduledAction }) => {
  // Error state
  if (!task) {
    return (
      <TaskError error="Your changes couldn't be saved. Please try again." />
    );
  }

  // Temporal feedback makes the edit feel real; re-emphasize the new next-run.
  const updatedDate = task.updated_at ? new Date(task.updated_at) : null;
  const updatedValid = updatedDate && isValid(updatedDate);
  const nextRunDate = task.next_run ? new Date(task.next_run) : null;
  const nextRunValid = nextRunDate && isValid(nextRunDate);

  const subtitle = nextRunValid
    ? `Next run ${format(nextRunDate as Date, "EEE 'at' h:mm a")}`
    : updatedValid
      ? `Updated ${formatDistanceToNow(updatedDate as Date, { addSuffix: true })}`
      : "Your changes have been saved.";

  // Success state
  return (
    <motion.div
      // A subtle blue ring keyed to "update" — distinct from create's emerald.
      initial={{ boxShadow: "0 0 0 0 rgba(59,130,246,0.0)" }}
      animate={{
        boxShadow: [
          "0 0 0 0 rgba(59,130,246,0.0)",
          "0 0 0 4px rgba(59,130,246,0.16)",
          "0 0 0 0 rgba(59,130,246,0.0)",
        ],
      }}
      transition={{ duration: 0.9, times: [0, 0.35, 1], ease: "easeOut" }}
      className="w-full max-w-xl rounded-2xl"
    >
      <ToolCard
        icon={PencilLine}
        tone="info"
        emphasized
        title="Task updated"
        subtitle={subtitle}
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
    </motion.div>
  );
};

export default UpdateTaskSuccess;
