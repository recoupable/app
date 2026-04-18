"use client";

import { FormEvent, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { toast } from "react-toastify";
import { createTask } from "@/lib/tasks/createTask";
import { validateCronExpression } from "@/lib/tasks/validateCronExpression";

export type CreateTaskFormErrors = Partial<
  Record<"title" | "prompt" | "schedule" | "artist", string>
>;

type SubmitFields = {
  title: string;
  prompt: string;
  schedule: string;
  model: string;
  artistAccountId: string;
  accountIdOverride: string | null;
};

export function useCreateTaskSubmit(fields: SubmitFields) {
  const router = useRouter();
  const { getAccessToken } = usePrivy();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<CreateTaskFormErrors>({});

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (isSubmitting) {
        return;
      }

      const {
        title,
        prompt,
        schedule,
        model,
        artistAccountId,
        accountIdOverride,
      } = fields;

      const nextErrors: CreateTaskFormErrors = {};
      if (!title.trim()) nextErrors.title = "Title is required.";
      if (!prompt.trim()) nextErrors.prompt = "Prompt is required.";
      const scheduleError = validateCronExpression(schedule);
      if (scheduleError) nextErrors.schedule = scheduleError;
      if (!artistAccountId.trim()) nextErrors.artist = "Artist is required.";

      setErrors(nextErrors);
      setSubmitError(null);

      if (Object.keys(nextErrors).length > 0) {
        return;
      }

      setIsSubmitting(true);
      try {
        const accessToken = await getAccessToken();
        if (!accessToken) {
          throw new Error("Please sign in to create a task.");
        }

        await createTask(accessToken, {
          title: title.trim(),
          prompt: prompt.trim(),
          schedule: schedule.trim(),
          artist_account_id: artistAccountId,
          ...(model.trim() ? { model: model.trim() } : {}),
          ...(accountIdOverride ? { account_id: accountIdOverride } : {}),
        });

        toast.success("Task created successfully.");
        router.push("/tasks");
        router.refresh();
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
    [
      fields.title,
      fields.prompt,
      fields.schedule,
      fields.model,
      fields.artistAccountId,
      fields.accountIdOverride,
      getAccessToken,
      isSubmitting,
      router,
    ],
  );

  const handleCancel = useCallback(() => {
    if (isSubmitting) return;
    router.push("/tasks");
  }, [isSubmitting, router]);

  return {
    handleSubmit,
    handleCancel,
    isSubmitting,
    submitError,
    errors,
  };
}
