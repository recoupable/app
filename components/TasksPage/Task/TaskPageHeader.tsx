import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/tasks/getTasks";
import AccountIdDisplay from "@/components/ArtistSetting/AccountIdDisplay";

/** Title + enabled state for the task page. */
const TaskPageHeader = ({ task }: { task: Task }) => {
  const isActive = Boolean(task.enabled);

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
    </div>
  );
};

export default TaskPageHeader;
