"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { toast } from "sonner";
import { createWeeklyReportTask } from "@/lib/onboarding/createWeeklyReportTask";
import { getWeeklyReportErrorMessage } from "@/lib/onboarding/getWeeklyReportErrorMessage";
import { useWeeklyReportTaskInput } from "@/hooks/useWeeklyReportTaskInput";

/**
 * One-click creation of the homepage starter task: the same weekly report
 * onboarding schedules, through the existing `POST /api/tasks` path which
 * also mints the schedule (recoupable/chat#1850, chat#2006).
 */
export function useCreateStarterTask() {
  const { getAccessToken } = usePrivy();
  const { resolve, isPreparing } = useWeeklyReportTaskInput();
  const queryClient = useQueryClient();

  const {
    mutate: handleCreateStarterTask,
    isPending: isCreating,
    isSuccess: isScheduled,
  } = useMutation({
    mutationFn: async () => {
      const input = resolve();
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("AUTH_REQUIRED");
      return createWeeklyReportTask(accessToken, input);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["scheduled-actions"],
        exact: false,
      });
      toast.success("Task scheduled for Mondays at 9am");
    },
    onError: (error) => toast.error(getWeeklyReportErrorMessage(error)),
  });

  return { handleCreateStarterTask, isCreating, isPreparing, isScheduled };
}
