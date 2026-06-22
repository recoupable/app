"use client";

import React from "react";
import { motion } from "framer-motion";
import { format, isValid } from "date-fns";
import { ScheduledAction } from "@/components/VercelChat/types";
import TaskCard from "./TaskCard";
import TaskError from "./TaskError";
import { CalendarCheck, CalendarClock } from "lucide-react";
import { ToolCard } from "../shared/ToolCard";
import { ToolEmpty } from "../shared/ToolEmpty";
import { isRecurring } from "@/lib/tasks/isRecurring";
import TaskDetailsDialog from "../../dialogs/tasks/TaskDetailsDialog";

interface CreateTaskSuccessProps {
  result: ScheduledAction;
}

const CreateTaskSuccess: React.FC<CreateTaskSuccessProps> = ({
  result: task,
}) => {
  // Error state
  if (!task) {
    return <TaskError error="The task couldn't be scheduled. Please try again." />;
  }

  // Confirm the consequence: when this first runs, not just "saved".
  const nextRunDate = task.next_run ? new Date(task.next_run) : null;
  const nextRunValid = nextRunDate && isValid(nextRunDate);
  const repeats = isRecurring(task.schedule);
  const subtitle = nextRunValid
    ? `First run ${format(nextRunDate as Date, "EEE 'at' h:mm a")}${
        repeats ? " · repeats" : ""
      }`
    : "Your task is scheduled and ready to run.";

  // Success state
  return (
    <motion.div
      // A brief emerald ring "lands" the creation, then settles.
      initial={{ boxShadow: "0 0 0 0 rgba(16,185,129,0.0)" }}
      animate={{
        boxShadow: [
          "0 0 0 0 rgba(16,185,129,0.0)",
          "0 0 0 4px rgba(16,185,129,0.18)",
          "0 0 0 0 rgba(16,185,129,0.0)",
        ],
      }}
      transition={{ duration: 0.9, times: [0, 0.35, 1], ease: "easeOut" }}
      className="w-full max-w-xl rounded-2xl"
    >
      <ToolCard
        icon={CalendarCheck}
        tone="success"
        emphasized
        title="Task scheduled"
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
            description="The task was created but no details were returned."
          />
        )}
      </ToolCard>
    </motion.div>
  );
};

export default CreateTaskSuccess;
