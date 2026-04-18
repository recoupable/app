"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { toast } from "react-toastify";
import { useAccountOverride } from "@/providers/AccountOverrideProvider";
import { createTask } from "@/lib/tasks/createTask";

export type CreateTaskFormPayload = {
  title: string;
  prompt: string;
  schedule: string;
  model: string;
  artistAccountId: string;
};

export function useTaskSubmit() {
  const router = useRouter();
  const { getAccessToken } = usePrivy();
  const { accountIdOverride } = useAccountOverride();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submitTask = useCallback(
    async (payload: CreateTaskFormPayload) => {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Please sign in to create a task.");
      }

      await createTask(accessToken, {
        title: payload.title.trim(),
        prompt: payload.prompt.trim(),
        schedule: payload.schedule.trim(),
        artist_account_id: payload.artistAccountId,
        ...(payload.model.trim() ? { model: payload.model.trim() } : {}),
        ...(accountIdOverride ? { account_id: accountIdOverride } : {}),
      });

      toast.success("Task created successfully.");
      router.push("/tasks");
      router.refresh();
    },
    [accountIdOverride, getAccessToken, router],
  );

  const runSubmit = useCallback(
    async (payload: CreateTaskFormPayload) => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        await submitTask(payload);
      } catch (error) {
        const rawMessage =
          error instanceof Error ? error.message : "Failed to create task.";
        const message = rawMessage.includes("HTTP 500")
          ? "Server failed to create the task. Verify cron/model fields and try a schedule preset."
          : rawMessage;
        setSubmitError(message);
        toast.error(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [submitTask],
  );

  return {
    submitTask: runSubmit,
    isSubmitting,
    submitError,
    setSubmitError,
  };
}
