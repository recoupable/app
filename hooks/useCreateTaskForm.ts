"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { toast } from "react-toastify";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { useAccountOverride } from "@/providers/AccountOverrideProvider";
import { createTask } from "@/lib/tasks/createTask";
import useAvailableModels from "@/hooks/useAvailableModels";
import { DEFAULT_MODEL } from "@/lib/consts";
import { validateCronExpression } from "@/lib/tasks/validateCronExpression";

type FormErrors = Partial<Record<"title" | "prompt" | "schedule" | "artist", string>>;

const DEFAULT_SCHEDULE = "0 9 * * *";

export function useCreateTaskForm() {
  const router = useRouter();
  const { getAccessToken } = usePrivy();
  const { sorted, selectedArtist, isLoading } = useArtistProvider();
  const {
    data: availableModels = [],
    isLoading: isModelsLoading,
    isError: isModelsError,
  } = useAvailableModels();
  const { accountIdOverride } = useAccountOverride();

  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
  const [model, setModel] = useState("");
  const [artistAccountId, setArtistAccountId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const artistOptions = useMemo(
    () =>
      sorted
        .filter((artist) => !!artist.account_id)
        .map((artist) => ({
          id: artist.account_id,
          label: artist.name?.trim() || artist.account_id,
        })),
    [sorted],
  );

  const modelOptions = useMemo(
    () =>
      [...availableModels]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((modelOption) => ({
          id: modelOption.id,
          label: modelOption.name,
        })),
    [availableModels],
  );

  const defaultModelLabel = useMemo(() => {
    const configuredDefault = availableModels.find(
      (modelOption) => modelOption.id === DEFAULT_MODEL,
    );
    return configuredDefault?.name
      ? `${configuredDefault.name} (${DEFAULT_MODEL})`
      : DEFAULT_MODEL;
  }, [availableModels]);

  useEffect(() => {
    if (!artistAccountId && selectedArtist?.account_id) {
      setArtistAccountId(selectedArtist.account_id);
    }
  }, [artistAccountId, selectedArtist?.account_id]);

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
    isLoadingArtists: isLoading,
  };
}
