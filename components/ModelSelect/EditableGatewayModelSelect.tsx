"use client";

import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import {
  PromptInputModelSelect,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
} from "@/components/ai-elements/prompt-input";
import ModelSelectItem from "@/components/ModelSelect/ModelSelectItem";
import useAvailableModels from "@/hooks/useAvailableModels";
import { organizeModels } from "@/lib/ai/organizeModels";
import { getFeaturedModelConfig } from "@/lib/ai/featuredModels";
import { DEFAULT_MODEL } from "@/lib/consts";

const DEFAULT_OPTION = "__default__";

type EditableGatewayModelSelectProps = {
  value: string;
  onValueChange: (modelId: string) => void;
  disabled?: boolean;
  label: string;
  /** When true, first row selects “default model” (empty string on change). */
  includeDefaultOption?: boolean;
  triggerId?: string;
  hintId?: string;
};

export function EditableGatewayModelSelect({
  value,
  onValueChange,
  disabled = false,
  label,
  includeDefaultOption = false,
  triggerId = "task-model",
  hintId = "task-model-hint",
}: EditableGatewayModelSelectProps) {
  const {
    data: availableModels = [],
    isLoading,
    isError,
  } = useAvailableModels();

  const organizedModels = useMemo(
    () => organizeModels(availableModels),
    [availableModels],
  );

  const defaultModelLabel = useMemo(() => {
    const configuredDefault = availableModels.find(
      (m) => m.id === DEFAULT_MODEL,
    );
    return configuredDefault?.name
      ? `${configuredDefault.name} (${DEFAULT_MODEL})`
      : DEFAULT_MODEL;
  }, [availableModels]);

  const modelConfig = getFeaturedModelConfig(value);
  const selectedModel = availableModels.find((m) => m.id === value);
  const displayName =
    modelConfig?.displayName || selectedModel?.name || value || "";

  const selectValue = includeDefaultOption
    ? value || DEFAULT_OPTION
    : value;

  return (
    <div className="space-y-2">
      <Label htmlFor={triggerId}>{label}</Label>
      <PromptInputModelSelect
        value={selectValue}
        onValueChange={(next) =>
          onValueChange(
            includeDefaultOption && next === DEFAULT_OPTION ? "" : next,
          )
        }
        disabled={disabled || isLoading}
      >
        <PromptInputModelSelectTrigger
          id={triggerId}
          aria-describedby={includeDefaultOption ? hintId : undefined}
        >
          <PromptInputModelSelectValue
            placeholder={
              includeDefaultOption ? "Use default model" : "Select a model"
            }
          >
            {includeDefaultOption && (!value || selectValue === DEFAULT_OPTION)
              ? `Use default model (${defaultModelLabel})`
              : displayName}
          </PromptInputModelSelectValue>
        </PromptInputModelSelectTrigger>
        <PromptInputModelSelectContent>
          {includeDefaultOption ? (
            <PromptInputModelSelectItem value={DEFAULT_OPTION} className="py-3">
              <span className="font-semibold text-sm text-foreground dark:text-white">
                Use default model ({defaultModelLabel})
              </span>
            </PromptInputModelSelectItem>
          ) : null}
          {organizedModels.featuredModels.map((model) => (
            <ModelSelectItem key={model.id} model={model} />
          ))}
          {organizedModels.otherModels.length > 0 ? (
            <>
              {organizedModels.featuredModels.length > 0 ? (
                <div className="my-1 h-px bg-border" />
              ) : null}
              <div className="px-3 py-2.5 text-sm font-medium text-muted-foreground">
                More Models
              </div>
              {organizedModels.otherModels.map((model) => (
                <ModelSelectItem key={model.id} model={model} />
              ))}
            </>
          ) : null}
        </PromptInputModelSelectContent>
      </PromptInputModelSelect>
      {includeDefaultOption ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          Default model: <span className="font-mono">{defaultModelLabel}</span>
        </p>
      ) : null}
      {isError ? (
        <p className="text-xs text-muted-foreground">
          Could not load model list. The default model will be used.
        </p>
      ) : null}
    </div>
  );
}
