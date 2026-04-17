"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DEFAULT_MODEL_OPTION = "__default__";

interface ModelOption {
  id: string;
  label: string;
}

interface ModelFieldProps {
  model: string;
  onModelChange: (value: string) => void;
  modelOptions: ModelOption[];
  defaultModelLabel: string;
  isModelsLoading: boolean;
  isModelsError: boolean;
  isSubmitting: boolean;
}

export function ModelField({
  model,
  onModelChange,
  modelOptions,
  defaultModelLabel,
  isModelsLoading,
  isModelsError,
  isSubmitting,
}: ModelFieldProps) {
  const selectValue = model || DEFAULT_MODEL_OPTION;

  return (
    <div className="space-y-2">
      <Label htmlFor="task-model">Model (optional)</Label>
      <Select
        value={selectValue}
        onValueChange={(value) =>
          onModelChange(value === DEFAULT_MODEL_OPTION ? "" : value)
        }
        disabled={isSubmitting || isModelsLoading}
      >
        <SelectTrigger id="task-model" aria-describedby="task-model-hint">
          <SelectValue placeholder="Use default model" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={DEFAULT_MODEL_OPTION}>
            {`Use default model (${defaultModelLabel})`}
          </SelectItem>
          {modelOptions.map((modelOption) => (
            <SelectItem key={modelOption.id} value={modelOption.id}>
              {modelOption.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p id="task-model-hint" className="text-xs text-muted-foreground">
        Default model: <span className="font-mono">{defaultModelLabel}</span>
      </p>
      {isModelsError ? (
        <p className="text-xs text-muted-foreground">
          Could not load model list. The default model will be used.
        </p>
      ) : null}
    </div>
  );
}
