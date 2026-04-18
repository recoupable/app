"use client";

import { FormEvent, useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { toast } from "react-toastify";
import { executeCreateTaskClient } from "@/lib/tasks/executeCreateTaskClient";
import { mapCreateTaskSubmitError } from "@/lib/tasks/mapCreateTaskSubmitError";
import {
  type CreateTaskFormErrors,
  validateCreateTaskFields,
} from "@/lib/tasks/validateCreateTaskFields";

export type { CreateTaskFormErrors };

type Fields = {
  title: string;
  prompt: string;
  schedule: string;
  model: string;
  artistAccountId: string;
  accountIdOverride: string | null;
};

export function useCreateTaskSubmit(fields: Fields) {
  const router = useRouter();
  const { getAccessToken } = usePrivy();
  const submittingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<CreateTaskFormErrors>({});

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (submittingRef.current) return;
      const next = validateCreateTaskFields({
        title: fields.title,
        prompt: fields.prompt,
        schedule: fields.schedule,
        artistAccountId: fields.artistAccountId,
      });
      setErrors(next);
      setSubmitError(null);
      if (Object.keys(next).length > 0) return;

      submittingRef.current = true;
      setIsSubmitting(true);
      try {
        await executeCreateTaskClient({ getAccessToken, ...fields });
        toast.success("Task created successfully.");
        router.push("/tasks");
        router.refresh();
      } catch (error) {
        const raw =
          error instanceof Error ? error.message : "Failed to create task.";
        const message = mapCreateTaskSubmitError(raw);
        setSubmitError(message);
        toast.error(message);
      } finally {
        submittingRef.current = false;
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
      router,
    ],
  );

  const handleCancel = useCallback(() => {
    if (isSubmitting) return;
    router.push("/tasks");
  }, [isSubmitting, router]);

  return { handleSubmit, handleCancel, isSubmitting, submitError, errors };
}
