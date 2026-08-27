import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/tasks/getTasks";
import AccountIdDisplay from "@/components/ArtistSetting/AccountIdDisplay";
import { formatScheduledActionDate } from "@/lib/utils/formatScheduledActionDate";
import { getTaskNextRunLabel } from "@/lib/tasks/getTaskNextRunLabel";

/**
 * Title, enabled state and the two facts a task page must answer at a glance:
 * when it last ran and when it runs next, always rendered, with words in
 * place of a missing value (app#2016 item 1).
 */
const TaskPageHeader = ({ task }: { task: Task }) => {
  const isActive = Boolean(task.enabled);
  const lastRun = task.recent_runs?.[0]?.createdAt ?? null;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        {isActive ? (
          <Play className="h-4 w-4 shrink-0 text-green-500" />
        ) : (
          <Pause className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <h1 className="truncate text-lg font-semibold">{task.title}</h1>
        <span
          className={cn(
            "ml-auto inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium",
            isActive
              ? "bg-green-100 text-green-800"
              : "bg-muted text-muted-foreground",
          )}
        >
          {isActive ? "Active" : "Paused"}
        </span>
      </div>
      <AccountIdDisplay accountId={task.id} label="Task ID" />
      <dl className="mt-1 flex flex-col gap-0.5 text-xs text-muted-foreground">
        <div className="flex gap-1.5">
          <dt className="font-medium text-foreground">Last run:</dt>
          <dd>{lastRun ? formatScheduledActionDate(lastRun) : "Never run"}</dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="font-medium text-foreground">Next run:</dt>
          <dd>{getTaskNextRunLabel(task)}</dd>
        </div>
      </dl>
    </div>
  );
};

export default TaskPageHeader;
