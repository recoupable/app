import { notFound } from "next/navigation";
import ProjectPage from "@/components/ProjectPage/ProjectPage";
import { isProjectId } from "@/lib/projects/isProjectId";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

/**
 * A client project's status (app#2048). A non-UUID segment is a not-found here
 * rather than a request the API has to answer.
 */
export default async function Page({ params }: PageProps) {
  const { projectId } = await params;
  if (!isProjectId(projectId)) notFound();

  return <ProjectPage projectId={projectId} />;
}
