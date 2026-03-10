"use client";

import Link from "next/link";
import { XCircle } from "lucide-react";
import { useTaskRunStatus } from "@/hooks/useTaskRunStatus";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
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
      <Breadcrumb className="px-6 pt-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/tasks?tab=recents">Tasks</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{runId}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {content}
    </div>
  );
}
