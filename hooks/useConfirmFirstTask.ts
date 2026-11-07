"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { toast } from "sonner";
import type { Task } from "@/lib/tasks/getTasks";
import { createWeeklyReportTask } from "@/lib/onboarding/createWeeklyReportTask";
import { updateTask } from "@/lib/tasks/updateTask";
import { getWeeklyReportErrorMessage } from "@/lib/onboarding/getWeeklyReportErrorMessage";
import {
  getFirstTaskConfirmPhase,
  type FirstTaskConfirmPhase,
  type FirstTaskDecision,
} from "@/lib/onboarding/getFirstTaskConfirmPhase";
import { useWeeklyReportTaskInput } from "@/hooks/useWeeklyReportTaskInput";

interface UseConfirmFirstTaskInput {
  catalogName?: string;
  /** False when the account already has an active task (see FirstTaskStep). */
  autoCreate?: boolean;
}

/**
 * The onboarding first task (chat#1867). `confirm` schedules the monthly
 * report through the existing `POST /api/tasks` path (which also mints the
 * schedule — same as useCreateStarterTask); FirstTaskConfirm calls it on its
 * own once the first report finishes (recoupable/app#1941). `turnOff` pauses
 * the created task rather than deleting it: a paused task still completes the
 * onboarding task checkpoint, so the home gate does not send the account back
 * into setup to create it again. Auth + artist come from providers.
 */
export function useConfirmFirstTask({
  catalogName,
  autoCreate = true,
}: UseConfirmFirstTaskInput) {
  const { getAccessToken } = usePrivy();
  const { resolve } = useWeeklyReportTaskInput();
  const queryClient = useQueryClient();
  const [decision, setDecision] = useState<FirstTaskDecision>("pending");

  const invalidateTasks = () =>
    queryClient.invalidateQueries({
      queryKey: ["scheduled-actions"],
      exact: false,
    });

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
    onSuccess: invalidateTasks,
    onError: (error) => toast.error(getWeeklyReportErrorMessage(error)),
  });

  const { mutate: pause, isPending: isTurningOff } = useMutation({
    mutationFn: async () => {
      if (!task) return;
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("AUTH_REQUIRED");
      await updateTask(accessToken, { id: task.id, enabled: false });
    },
    onSuccess: async () => {
      setDecision("declined");
      await invalidateTasks();
    },
    onError: () =>
      toast.error("Couldn't turn off the monthly report. Please try again."),
  });

  const confirm = () => {
    setDecision("confirmed");
    mutate();
  };
  const turnOff = () => pause();

  const phase: FirstTaskConfirmPhase = getFirstTaskConfirmPhase({
    decision,
    isCreating: isPending,
    hasTask: Boolean(task),
    autoCreate,
  });

  return {
    confirm,
    turnOff,
    phase,
    task,
    hasStarted: decision !== "pending",
    isTurningOff,
  };
}
