import Link from "next/link";
import { cn } from "@/lib/utils";
import type { TaskRunItem } from "@/lib/tasks/getTaskRuns";
import { getRunDisplayName } from "@/lib/tasks/getRunDisplayName";
import { getStatusColor } from "@/lib/tasks/getStatusColor";
import { getStatusLabel } from "@/lib/tasks/getStatusLabel";
import { formatTimestamp } from "@/lib/tasks/formatTimestamp";
import { getRunHref } from "@/lib/tasks/getRunHref";

/**
 * Compact task-run row for the homepage tasks module. Links to the
 * existing run detail page. Renders the originating scheduled task's
 * title when the api resolves one, falling back to the generic
 * per-taskIdentifier label. Per-run sent-email subjects are not exposed
 * by `GET /api/tasks/runs` yet (recoupable/chat#1850).
 */
const HomeRunRow = ({ run }: { run: TaskRunItem }) => (
  <Link
    href={getRunHref(run.id)}
    className="group -mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted"
  >
    <div className="min-w-0">
      <p className="truncate text-sm font-medium text-foreground">
        {getRunDisplayName(run)}
      </p>
      <p className="text-xs text-muted-foreground">
        {formatTimestamp(run.finishedAt ?? run.createdAt)}
      </p>
    </div>
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-1 text-xs font-medium",
        getStatusColor(run.status),
      )}
    >
      {getStatusLabel(run.status)}
    </span>
  </Link>
);

export default HomeRunRow;
