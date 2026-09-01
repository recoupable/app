"use client";

import PageContainer from "@/components/TasksPage/PageContainer";
import RunPageSkeleton from "@/components/TasksPage/Run/RunPageSkeleton";
import { useProject } from "@/hooks/useProject";
import { useProjectTask } from "@/hooks/useProjectTask";
import { useUserProvider } from "@/providers/UserProvder";
import { getTaskState } from "@/lib/projects/getTaskState";
import ProjectNotFound from "../ProjectNotFound";
import ProjectTaskBreadcrumb from "./ProjectTaskBreadcrumb";
import ProjectTaskHeader from "./ProjectTaskHeader";
import ProjectTaskCompletion from "./ProjectTaskCompletion";
import ProjectTaskTabs from "./ProjectTaskTabs";

/**
 * `/projects/{projectId}/tasks/{taskId}` (app#2048): one task, its completion
 * control, and the thread against it.
 */
export default function ProjectTaskPage({
  projectId,
  taskId,
}: {
  projectId: string;
  taskId: string;
}) {
  const { data, isPending, error } = useProjectTask(projectId, taskId);
  // Only for the breadcrumb label; the task read is what gates the page.
  const { data: project } = useProject(projectId);
  const { userData } = useUserProvider();

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
              : "No task with this id on your account."
          }
        />
      </PageContainer>
    );
  }

  const { isComplete, needsYou } = getTaskState(
    data.task,
    userData?.account_id ?? null,
  );

  return (
    <div className="grow pb-8">
      <PageContainer className="flex flex-col gap-5">
        <ProjectTaskBreadcrumb
          projectId={projectId}
          projectName={project?.project.name ?? "Project"}
          title={data.task.title}
        />
        <ProjectTaskHeader
          task={data.task}
          isComplete={isComplete}
          needsYou={needsYou}
        />
        <div className="border-y border-border py-4">
          <ProjectTaskCompletion
            projectId={projectId}
            taskId={data.task.id}
            isComplete={isComplete}
          />
        </div>
        <ProjectTaskTabs projectId={projectId} data={data} />
      </PageContainer>
    </div>
  );
}
