import { cn } from "@/lib/utils";
import { TaskRunItem } from "@/lib/tasks/getTaskRuns";
import { getStatusColor } from "@/lib/tasks/getStatusColor";
import { getStatusLabel } from "@/lib/tasks/getStatusLabel";
import { formatTimestamp } from "@/lib/tasks/formatTimestamp";
import { formatDuration } from "@/lib/tasks/formatDuration";

interface TaskRecentRunsSectionProps {
  recentRuns?: TaskRunItem[];
  isDeleted?: boolean;
}

const TaskRecentRunsSection = ({
  recentRuns,
  isDeleted,
}: TaskRecentRunsSectionProps) => {
  if (!recentRuns || recentRuns.length === 0) return null;

  return (
    <div className={cn("pt-2 mt-1 border-t border-border", { "border-red-100": isDeleted })}>
      <p className={cn("text-xs font-medium text-foreground mb-1.5", { "text-red-700": isDeleted })}>
        Last Runs
      </p>
      <div className="flex flex-col gap-1">
        {recentRuns.map((run) => {
          const duration = formatDuration(run.durationMs);
          return (
            <button
              key={run.id}
              type="button"
              onClick={() => window.open(`/tasks/${run.id}`, "_blank")}
              className="flex items-center justify-between gap-2 text-xs w-full hover:bg-muted/50 rounded px-1 -mx-1 py-0.5 transition-colors cursor-pointer"
            >
              <span className={cn("text-muted-foreground", { "text-red-600": isDeleted })}>
                {run.startedAt ? formatTimestamp(run.startedAt) : formatTimestamp(run.createdAt)}
                {duration && ` · ${duration}`}
              </span>
              <span className={cn("px-1.5 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0", getStatusColor(run.status))}>
                {getStatusLabel(run.status)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TaskRecentRunsSection;
