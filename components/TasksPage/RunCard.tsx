import Link from "next/link";
import { cn } from "@/lib/utils";
import type { TaskRunItem } from "@/lib/tasks/getTaskRuns";
import { getTaskDisplayName } from "@/lib/tasks/getTaskDisplayName";
import { getStatusColor } from "@/lib/tasks/getStatusColor";
import { getStatusLabel } from "@/lib/tasks/getStatusLabel";
import { formatDuration } from "@/lib/tasks/formatDuration";
import { formatTimestamp } from "@/lib/tasks/formatTimestamp";
import CopyIconButton from "@/components/ui/copy-icon-button";

interface RunCardProps {
  run: TaskRunItem;
}

const RunCard: React.FC<RunCardProps> = ({ run }) => {
  const duration = formatDuration(run.durationMs);

  return (
    <Link href={`/tasks/${run.id}`} className="group flex items-center justify-between py-4 px-4 hover:bg-muted dark:hover:bg-[#1a1a1a] transition-colors -mx-4 cursor-pointer">
      <div className="flex items-center space-x-4">
        <div>
          <div className="flex items-center gap-1.5">
            <h4 className="text-base font-medium text-foreground">
              {getTaskDisplayName(run.taskIdentifier)}
            </h4>
            <CopyIconButton
              value={run.id}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {formatTimestamp(run.createdAt)}
            {duration && ` \u00b7 ${duration}`}
          </p>
        </div>
      </div>

      <div className="flex items-center">
        <span
          className={cn(
            "px-2 py-1 text-xs font-medium rounded-full",
            getStatusColor(run.status),
          )}
        >
          {getStatusLabel(run.status)}
        </span>
      </div>
    </Link>
  );
};

export default RunCard;
