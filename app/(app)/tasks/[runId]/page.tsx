import RunPage from "@/components/TasksPage/Run/RunPage";

interface PageProps {
  params: Promise<{ runId: string }>;
}

export default async function TaskRunPage({ params }: PageProps) {
  const { runId } = await params;

  return <RunPage runId={runId} />;
}
