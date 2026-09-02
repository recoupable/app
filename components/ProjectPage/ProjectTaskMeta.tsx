import { Calendar, MessageSquare } from "lucide-react";
import { formatTaskDate } from "@/lib/projects/formatTaskDate";
import type { ProjectTask } from "@/lib/projects/types";

/** Due or completed date, plus the comment count when there is one. */
const ProjectTaskMeta = ({ task }: { task: ProjectTask }) => {
  const completed = formatTaskDate(task.completed_at);
  const due = formatTaskDate(task.due_date);
  const date = completed ? `Completed ${completed}` : due ? `Due ${due}` : null;

  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      {date && (
        <span className="inline-flex items-center gap-1.5">
          <Calendar className="size-3.5" />
          {date}
        </span>
      )}
      {!!task.comment_count && (
        <span className="inline-flex items-center gap-1.5">
          <MessageSquare className="size-3.5" />
          {task.comment_count}
        </span>
      )}
    </div>
  );
};

export default ProjectTaskMeta;
