import Link from "next/link";
import type { Task } from "@/lib/tasks/getTasks";
import { getCronHumanPreview } from "@/lib/tasks/getCronHumanPreview";
import { getTaskNextRun } from "@/lib/tasks/getTaskNextRun";
import { formatScheduledActionDate } from "@/lib/utils/formatScheduledActionDate";

/**
 * Homepage tasks module state for an account whose weekly report is
 * scheduled but has not run yet (chat#2006): names the task and its next
 * run instead of offering the starter card again, which would schedule a
 * duplicate. Mirrors the confirm state of the onboarding first task.
 */
const ScheduledTaskLine = ({ task }: { task: Task }) => {
  const nextRunAt = getTaskNextRun(task);
  const nextRun = nextRunAt
    ? formatScheduledActionDate(nextRunAt)
    : (getCronHumanPreview(task.schedule) ?? task.schedule);

  return (
    <div role="status">
      <p className="text-sm font-medium text-foreground">{task.title}</p>
      <p className="text-sm text-muted-foreground">
        Next run: {nextRun}.{" "}
        <Link href="/tasks" className="underline hover:text-foreground">
          View your tasks
        </Link>
      </p>
    </div>
  );
};

export default ScheduledTaskLine;
