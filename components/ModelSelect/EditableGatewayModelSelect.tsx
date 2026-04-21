"use client";

import useAvailableModels from "@/hooks/useAvailableModels";
import { GatewayModelSelect } from "./GatewayModelSelect";

type EditableGatewayModelSelectProps = {
  value: string;
  onValueChange: (modelId: string) => void;
  disabled?: boolean;
  label: string;
  /** When true, first row selects "default model" (empty string on change). */
  includeDefaultOption?: boolean;
  triggerId?: string;
  hintId?: string;
};

export function EditableGatewayModelSelect({
  triggerId = "task-model",
  hintId = "task-model-hint",
  ...props
}: EditableGatewayModelSelectProps) {
  const {
    data: availableModels = [],
    isLoading,
    isError,
  } = useAvailableModels();

  return (
    <GatewayModelSelect
      {...props}
      availableModels={availableModels}
      isLoading={isLoading}
      isError={isError}
      triggerId={triggerId}
      hintId={hintId}
    />
  );
}
