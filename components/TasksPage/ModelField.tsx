"use client";

import { EditableGatewayModelSelect } from "@/components/ModelSelect/EditableGatewayModelSelect";
import { useCreateTaskFormContext } from "@/providers/CreateTaskFormProvider";

export function ModelField() {
  const { model, setModel, isSubmitting } = useCreateTaskFormContext();

  return (
    <EditableGatewayModelSelect
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
