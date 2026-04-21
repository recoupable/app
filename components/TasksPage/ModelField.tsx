"use client";

import { GatewayModelSelect } from "@/components/ModelSelect/GatewayModelSelect";
import { useCreateTaskFormContext } from "@/providers/CreateTaskFormProvider";

export function ModelField() {
  const { model, setModel } = useCreateTaskFormContext();
  return <GatewayModelSelect value={model} onValueChange={setModel} />;
}
