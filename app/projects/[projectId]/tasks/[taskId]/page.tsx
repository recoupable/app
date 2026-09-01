import { notFound } from "next/navigation";
import ProjectTaskPage from "@/components/ProjectPage/Task/ProjectTaskPage";
import { isProjectId } from "@/lib/projects/isProjectId";

interface PageProps {
  params: Promise<{ projectId: string; taskId: string }>;
}

/** One task on a client project (app#2048). */
export default async function Page({ params }: PageProps) {
  const { projectId, taskId } = await params;
  if (!isProjectId(projectId) || !isProjectId(taskId)) notFound();

  return <ProjectTaskPage projectId={projectId} taskId={taskId} />;
}
