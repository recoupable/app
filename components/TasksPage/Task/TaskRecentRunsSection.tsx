import { TaskRunItem } from "@/lib/tasks/getTaskRuns";
import { getStatusColor } from "@/lib/tasks/getStatusColor";
import { getStatusLabel } from "@/lib/tasks/getStatusLabel";
import { formatTimestamp } from "@/lib/tasks/formatTimestamp";
import { formatDuration } from "@/lib/tasks/formatDuration";
import { getRunHref } from "@/lib/tasks/getRunHref";

interface TaskRecentRunsSectionProps {
  recentRuns?: TaskRunItem[];
}

const TaskRecentRunsSection = ({ recentRuns }: TaskRecentRunsSectionProps) => {
  if (!recentRuns || recentRuns.length === 0) return null;

  return (
    <div className="pt-2 mt-1 border-t border-border">
      <p className="text-xs font-medium text-foreground mb-1.5">Last Runs</p>
      <div className="flex flex-col gap-1">
        {recentRuns.map((run) => {
          const duration = formatDuration(run.durationMs);
          return (
            <button
              key={run.id}
              type="button"
              onClick={() => window.open(getRunHref(run.id), "_blank")}
              className="flex items-center justify-between gap-2 text-xs w-full hover:bg-muted/50 rounded px-1 -mx-1 py-0.5 transition-colors cursor-pointer"
            >
              <span className="text-muted-foreground">
                {run.startedAt
                  ? formatTimestamp(run.startedAt)
                  : formatTimestamp(run.createdAt)}
                {duration && ` · ${duration}`}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0 ${getStatusColor(run.status)}`}
              >
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
