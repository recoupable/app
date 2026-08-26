"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { toast } from "sonner";
import type { Task } from "@/lib/tasks/getTasks";
import { createWeeklyReportTask } from "@/lib/onboarding/createWeeklyReportTask";
import { getWeeklyReportErrorMessage } from "@/lib/onboarding/getWeeklyReportErrorMessage";
import {
  getFirstTaskConfirmPhase,
  type FirstTaskConfirmPhase,
  type FirstTaskDecision,
} from "@/lib/onboarding/getFirstTaskConfirmPhase";
import { useWeeklyReportTaskInput } from "@/hooks/useWeeklyReportTaskInput";

interface UseConfirmFirstTaskInput {
  catalogName?: string;
}

/**
 * Confirm/decline for the onboarding first task (chat#1867). Confirm
 * schedules the weekly report through the existing `POST /api/tasks`
 * path (which also mints the schedule — same as useCreateStarterTask);
 * decline creates nothing. Auth + artist come from providers.
 */
export function useConfirmFirstTask({ catalogName }: UseConfirmFirstTaskInput) {
  const { getAccessToken } = usePrivy();
  const { resolve } = useWeeklyReportTaskInput();
  const queryClient = useQueryClient();
  const [decision, setDecision] = useState<FirstTaskDecision>("pending");

  const {
    mutate,
    isPending,
    data: task,
  } = useMutation<Task>({
    mutationFn: async () => {
      const input = resolve();
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("AUTH_REQUIRED");
      return createWeeklyReportTask(accessToken, { ...input, catalogName });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["scheduled-actions"],
        exact: false,
      });
    },
    onError: (error) => toast.error(getWeeklyReportErrorMessage(error)),
  });

  const confirm = () => {
    setDecision("confirmed");
    mutate();
  };
  const decline = () => setDecision("declined");

  const phase: FirstTaskConfirmPhase = getFirstTaskConfirmPhase({
    decision,
    isCreating: isPending,
    hasTask: Boolean(task),
  });

  return { confirm, decline, phase, task };
}
