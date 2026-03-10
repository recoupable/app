"use client";

import { XCircle } from "lucide-react";
import { useTaskRunStatus } from "@/hooks/useTaskRunStatus";
import RunBreadcrumb from "./RunBreadcrumb";
import RunPageSkeleton from "./RunPageSkeleton";
import RunDetails from "./RunDetails";

interface RunPageProps {
  runId: string;
}

export default function RunPage({ runId }: RunPageProps) {
  const { data, isLoading, error } = useTaskRunStatus(runId);

  let content;

  if (isLoading || !data) {
    content = <RunPageSkeleton />;
  } else if (error) {
    content = (
      <div className="flex flex-col items-center justify-center p-4">
        <XCircle className="size-8 text-red-500" />
        <p className="mt-3 text-sm text-red-500">
          {error instanceof Error ? error.message : "Failed to load run status"}
        </p>
      </div>
    );
  } else {
    content = <RunDetails runId={runId} data={data} />;
  }

  return (
    <div className="h-screen max-w-2xl">
      <RunBreadcrumb runId={runId} />
      {content}
    </div>
  );
}
