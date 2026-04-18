import { createTask } from "@/lib/tasks/createTask";

type PrivyGetToken = () => Promise<string | undefined | null>;

/** Performs POST /api/tasks after the caller has validated fields. */
export async function executeCreateTaskClient(args: {
  getAccessToken: PrivyGetToken;
  title: string;
  prompt: string;
  schedule: string;
  artistAccountId: string;
  model: string;
  accountIdOverride: string | null;
}): Promise<void> {
  const accessToken = await args.getAccessToken();
  if (!accessToken) {
    throw new Error("Please sign in to create a task.");
  }
  await createTask(accessToken, {
    title: args.title.trim(),
    prompt: args.prompt.trim(),
    schedule: args.schedule.trim(),
    artist_account_id: args.artistAccountId,
    ...(args.model.trim() ? { model: args.model.trim() } : {}),
    ...(args.accountIdOverride ? { account_id: args.accountIdOverride } : {}),
  });
}
