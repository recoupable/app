"use client";

import { useMemo } from "react";
import useAvailableModels from "@/hooks/useAvailableModels";
import { DEFAULT_MODEL } from "@/lib/consts";

export function useModelOptions() {
  const {
    data: availableModels = [],
    isLoading: isModelsLoading,
    isError: isModelsError,
  } = useAvailableModels();

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

  return {
    modelOptions,
    defaultModelLabel,
    isModelsLoading,
    isModelsError,
  };
}
