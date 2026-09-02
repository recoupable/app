import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ProjectTaskMeta from "./ProjectTaskMeta";
import type { ProjectTask } from "@/lib/projects/types";

/** One task in the list. Everything not waiting on the viewer renders like this. */
const ProjectTaskRow = ({ task }: { task: ProjectTask }) => (
  <Link
    href={`/projects/${task.project_id}/tasks/${task.id}`}
    className="flex items-start gap-4 border-b border-border py-4 transition-colors hover:bg-muted/50"
  >
    <div className="flex grow flex-col gap-1.5">
      <span className="text-base font-medium text-foreground">{task.title}</span>
      {task.description && (
        <span className="text-sm leading-relaxed text-muted-foreground">
          {task.description}
        </span>
      )}
      <ProjectTaskMeta task={task} />
    </div>
    <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
  </Link>
);

export default ProjectTaskRow;
