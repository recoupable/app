import React from "react";
import { ToolError } from "../shared/ToolError";

interface TaskErrorProps {
  message?: string;
  error: string;
  title?: string;
}

const TaskError: React.FC<TaskErrorProps> = ({
  message,
  error,
  title = "Task Error",
}) => {
  const detail = [message, error]
    .filter((part): part is string => Boolean(part?.trim()))
    // Avoid showing the same string twice when message === error.
    .filter((part, index, all) => all.indexOf(part) === index)
    .join("\n\n");

  return (
    <ToolError
      title={title}
      message={detail || "An error occurred while processing the task"}
    />
  );
};

export default TaskError;
