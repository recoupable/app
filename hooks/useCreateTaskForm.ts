"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useArtistOptions } from "@/hooks/createTask/useArtistOptions";
import { useModelOptions } from "@/hooks/createTask/useModelOptions";
import { useTaskSubmit } from "@/hooks/createTask/useTaskSubmit";
import { validateCronExpression } from "@/lib/tasks/validateCronExpression";

type FormErrors = Partial<Record<"title" | "prompt" | "schedule" | "artist", string>>;

const DEFAULT_SCHEDULE = "0 9 * * *";

export function useCreateTaskForm() {
  const router = useRouter();
  const {
    artistOptions,
    artistAccountId,
    setArtistAccountId,
    isLoadingArtists,
  } = useArtistOptions();
  const {
    modelOptions,
    defaultModelLabel,
    isModelsLoading,
    isModelsError,
  } = useModelOptions();
  const { submitTask, isSubmitting, submitError, setSubmitError } =
    useTaskSubmit();

  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
  const [model, setModel] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    const nextErrors: FormErrors = {};
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

    await submitTask({
      title,
      prompt,
      schedule,
      model,
      artistAccountId,
    });
  };

  const handleCancel = () => {
    if (isSubmitting) return;
    router.push("/tasks");
  };

  return {
    title,
    setTitle,
    prompt,
    setPrompt,
    schedule,
    setSchedule,
    model,
    setModel,
    artistAccountId,
    setArtistAccountId,
    isSubmitting,
    submitError,
    errors,
    handleSubmit,
    handleCancel,
    artistOptions,
    modelOptions,
    defaultModelLabel,
    isModelsLoading,
    isModelsError,
    isLoadingArtists,
  };
}
