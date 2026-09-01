"use client";

import { useMemo } from "react";
import PageContainer from "@/components/TasksPage/PageContainer";
import RunPageSkeleton from "@/components/TasksPage/Run/RunPageSkeleton";
import { useProject } from "@/hooks/useProject";
import { useUserProvider } from "@/providers/UserProvder";
import { splitProjectTasks } from "@/lib/projects/splitProjectTasks";
import ProjectProgress from "./ProjectProgress";
import ProjectTasksTabs from "./ProjectTasksTabs";
import ProjectNotFound from "./ProjectNotFound";

/**
 * `/projects/{projectId}`: what a client sees of the work we are doing for
 * them (app#2048). Active items first with their own pinned above, completed
 * below.
 */
export default function ProjectPage({ projectId }: { projectId: string }) {
  const { data, isPending, error } = useProject(projectId);
  const { userData } = useUserProvider();
  const viewerAccountId = userData?.account_id ?? null;

  const tasks = useMemo(
    () => splitProjectTasks(data?.tasks ?? [], viewerAccountId),
    [data?.tasks, viewerAccountId],
  );

  // isPending covers the window where the query waits on Privy auth as well as
  // the fetch, so the not-found copy cannot flash before either has run
  // (the same trap app#2016 item 4 fixed on the task page).
  if (isPending) {
    return (
      <PageContainer className="h-screen">
        <RunPageSkeleton />
      </PageContainer>
    );
  }

  if (error || !data) {
    return (
      <PageContainer className="h-screen">
        <ProjectNotFound
          message={
            error instanceof Error
              ? error.message
              : "No project with this id on your account."
          }
        />
      </PageContainer>
    );
  }

  return (
    <div className="grow py-8">
      <PageContainer className="flex flex-col gap-6">
        <div className="flex flex-col gap-2.5">
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            {data.project.name}
          </h1>
          <p className="font-sans text-lg font-light text-muted-foreground">
            Live status of the work Recoupable is doing for you. Comment on any
            task to reach us.
          </p>
        </div>

        <ProjectProgress
          done={tasks.completed.length}
          total={data.tasks.length}
          needsYou={tasks.needsYou.length}
        />

        <ProjectTasksTabs tasks={tasks} />
      </PageContainer>
    </div>
  );
}
