"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { TaskRunStatus } from "@/lib/tasks/getTaskRunStatus";
import { getTaskDisplayName } from "@/lib/tasks/getTaskDisplayName";
import { STATUS_CONFIG, FALLBACK_CONFIG } from "./statusConfig";
import RunDetailsContent from "./RunDetailsContent";

export interface RunDetailsProps {
  runId: string;
  data: TaskRunStatus;
}

export default function RunDetails({ runId, data }: RunDetailsProps) {
  const config = STATUS_CONFIG[data.status] ?? FALLBACK_CONFIG;
  const pathname = usePathname();
  const isOnRunPage = pathname === `/tasks/${runId}`;
  const displayName = getTaskDisplayName(data.taskIdentifier);

  return (
    <div className="mx-auto flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        {config.icon}
        <div>
          {isOnRunPage ? (
            <h1 className="text-lg font-semibold">{displayName}</h1>
          ) : (
            <Link
              href={`/tasks/${runId}`}
              target="_blank"
              className="text-lg font-semibold hover:underline"
            >
              {displayName}
            </Link>
          )}
          <p className={`text-sm ${config.color}`}>{config.label}</p>
        </div>
      </div>

      <RunDetailsContent runId={runId} data={data} />
    </div>
  );
}
