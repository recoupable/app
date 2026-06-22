"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ListTodo } from "lucide-react";
import { ScheduledAction } from "@/components/VercelChat/types";
import { ToolCard } from "../shared/ToolCard";
import { ToolEmpty } from "../shared/ToolEmpty";
import TaskCard from "./TaskCard";
import TaskDetailsDialog from "@/components/VercelChat/dialogs/tasks/TaskDetailsDialog";

export interface GetTasksSuccessProps {
  result: ScheduledAction[];
}

// Cap the cascade so long lists don't feel slow to assemble.
const STAGGER_CAP = 8;

const GetTasksSuccess: React.FC<GetTasksSuccessProps> = ({ result: tasks }) => {
  const reduce = useReducedMotion();
  const count = tasks?.length ?? 0;
  const isEmpty = count === 0;

  return (
    <ToolCard
      icon={ListTodo}
      tone="info"
      title="Tasks"
      subtitle={isEmpty ? "No scheduled tasks" : "Scheduled tasks"}
      trailing={
        isEmpty ? undefined : (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
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
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={reduce ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reduce ? 0 : 0.24,
                delay: reduce ? 0 : Math.min(index, STAGGER_CAP) * 0.04,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <TaskDetailsDialog task={task}>
                <TaskCard task={task} />
              </TaskDetailsDialog>
            </motion.div>
          ))}
        </div>
      )}
    </ToolCard>
  );
};

export default GetTasksSuccess;
