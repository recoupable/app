import Link from "next/link";
import NeedsYouPill from "./NeedsYouPill";
import ProjectTaskMeta from "./ProjectTaskMeta";
import type { ProjectTask } from "@/lib/projects/types";

/**
 * A task waiting on the viewer, pinned above the list as a card.
 *
 * The card treatment, not the pill alone, is what separates it: a client opens
 * this link to find out what is being asked of them, and a plain row in sort
 * order can be scrolled past.
 */
const NeedsYouCard = ({ task }: { task: ProjectTask }) => (
  <Link
    href={`/projects/${task.project_id}/tasks/${task.id}`}
    className="flex flex-col gap-2 rounded-lg bg-card p-4 shadow-[0px_0px_0px_1px_var(--border),0px_2px_4px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0px_0px_0px_1px_var(--border),0px_4px_8px_rgba(0,0,0,0.06)]"
  >
    <div className="flex items-start gap-3">
      <div className="flex grow flex-col gap-1.5">
        <span className="text-base font-medium text-foreground">{task.title}</span>
        {task.description && (
          <span className="text-sm leading-relaxed text-muted-foreground">
            {task.description}
          </span>
        )}
      </div>
      <NeedsYouPill />
    </div>
    <ProjectTaskMeta task={task} />
  </Link>
);

export default NeedsYouCard;
