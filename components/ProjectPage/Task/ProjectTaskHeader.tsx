import { Calendar, CheckCircle2 } from "lucide-react";
import NeedsYouPill from "../NeedsYouPill";
import { formatTaskDate } from "@/lib/projects/formatTaskDate";
import type { ProjectTask } from "@/lib/projects/types";

/** Title, status, date and description for one task. */
const ProjectTaskHeader = ({
  task,
  isComplete,
  needsYou,
}: {
  task: ProjectTask;
  isComplete: boolean;
  needsYou: boolean;
}) => {
  const completed = formatTaskDate(task.completed_at);
  const due = formatTaskDate(task.due_date);

  return (
    <div className="flex flex-col gap-3">
      <h1 className="font-heading text-2xl font-bold tracking-tight">
        {task.title}
      </h1>
      <div className="flex flex-wrap items-center gap-3">
        {isComplete ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600 dark:text-green-400">
            <CheckCircle2 className="size-3.5" />
            Completed
          </span>
        ) : (
          needsYou && <NeedsYouPill />
        )}
        {(completed || due) && (
          <span className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <Calendar className="size-3.5" />
            {completed ? `Completed ${completed}` : `Due ${due}`}
          </span>
        )}
      </div>
      {task.description && (
        <p className="text-[15px] leading-relaxed">{task.description}</p>
      )}
    </div>
  );
};

export default ProjectTaskHeader;
