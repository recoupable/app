"use client";

import { GatewayModelSelect } from "@/components/ModelSelect/GatewayModelSelect";
import { useCreateTaskFormContext } from "@/providers/CreateTaskFormProvider";

export function ModelField() {
  const { model, setModel, isSubmitting } = useCreateTaskFormContext();

  return (
    <GatewayModelSelect
      value={model}
      onValueChange={setModel}
      disabled={isSubmitting}
      label="Model (optional)"
      includeDefaultOption
      triggerId="task-model"
      hintId="task-model-hint"
    />
  );
}
