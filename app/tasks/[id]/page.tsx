import { notFound } from "next/navigation";
import TaskPage from "@/components/TasksPage/Task/TaskPage";
import { isTaskId } from "@/lib/tasks/isTaskId";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * A single scheduled task (chat#2006 item 2). Run pages live at
 * `/runs/{runId}`; a `run_…` or otherwise non-UUID segment here is a
 * not-found, never silently served as something else.
 */
export default async function TaskDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!isTaskId(id)) notFound();

  return <TaskPage taskId={id} />;
}
