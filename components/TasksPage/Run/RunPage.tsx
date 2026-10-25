"use client";

import { useSearchParams } from "next/navigation";
import RunAccountNotice from "../RunAccountNotice";
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
  const searchParams = useSearchParams();
  const accountIdOverride = searchParams.get("account_id") ?? undefined;
  const { data, isPending, error, scopeReady, accountId } = useTaskRunStatus(
    runId,
    { accountIdOverride },
  );

  let content;

  if (scopeReady === false) {
    content = null;
  } else if (isPending) {
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
    content = <RunDetails runId={runId} data={data} accountId={accountId} />;
  }

  return (
    <PageContainer className="h-screen">
      <RunBreadcrumb runId={runId} accountId={accountIdOverride ?? accountId} />
      <div className="px-6 pt-4">
        <RunAccountNotice
          scopeReady={scopeReady}
          accountId={accountId}
          explicit={accountIdOverride !== undefined}
        />
      </div>
      {content}
    </PageContainer>
  );
}
