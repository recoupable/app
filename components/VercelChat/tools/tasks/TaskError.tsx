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
  // Callers historically pass the same string as title/message/error. Build a
  // detail from the distinct parts only, and drop any part that merely repeats
  // the title — so the body never echoes the heading. A cause still shows when
  // it genuinely differs.
  const normalizedTitle = title.trim();
  const detail = [message, error]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .filter((part) => part !== normalizedTitle)
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
