"use client";

import { useState } from "react";
import { useAccountOverride } from "@/providers/AccountOverrideProvider";
import { useCreateTaskArtistOptions } from "@/hooks/useCreateTaskArtistOptions";
import { useCreateTaskModelOptions } from "@/hooks/useCreateTaskModelOptions";
import { useCreateTaskSubmit } from "@/hooks/useCreateTaskSubmit";

const DEFAULT_SCHEDULE = "0 9 * * *";

export function useCreateTaskForm() {
  const { accountIdOverride } = useAccountOverride();
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
  const [model, setModel] = useState("");

  const artist = useCreateTaskArtistOptions();
  const models = useCreateTaskModelOptions();
  const { handleSubmit, handleCancel, isSubmitting, submitError, errors } =
    useCreateTaskSubmit({
      title,
      prompt,
      schedule,
      model,
      artistAccountId: artist.artistAccountId,
      accountIdOverride,
    });

  return {
    title,
    setTitle,
    prompt,
    setPrompt,
    schedule,
    setSchedule,
    model,
    setModel,
    artistAccountId: artist.artistAccountId,
    setArtistAccountId: artist.setArtistAccountId,
    isSubmitting,
    submitError,
    errors,
    handleSubmit,
    handleCancel,
    artistOptions: artist.artistOptions,
    modelOptions: models.modelOptions,
    defaultModelLabel: models.defaultModelLabel,
    isModelsLoading: models.isModelsLoading,
    isModelsError: models.isModelsError,
    isLoadingArtists: artist.isLoadingArtists,
  };
}
