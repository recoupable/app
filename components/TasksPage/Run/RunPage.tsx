"use client";

import { XCircle } from "lucide-react";
import { useTaskRunStatus } from "@/hooks/useTaskRunStatus";
import RunBreadcrumb from "./RunBreadcrumb";
import PageContainer from "@/components/TasksPage/PageContainer";
import RunPageSkeleton from "./RunPageSkeleton";
import RunDetails from "./RunDetails";

interface RunPageProps {
  runId: string;
}

export default function RunPage({ runId }: RunPageProps) {
  const { data, isPending, error } = useTaskRunStatus(runId);

  let content;

  if (isPending) {
    content = <RunPageSkeleton />;
  } else if (error || !data) {
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
    <PageContainer className="h-screen">
      <RunBreadcrumb runId={runId} />
      {content}
    </PageContainer>
  );
}
