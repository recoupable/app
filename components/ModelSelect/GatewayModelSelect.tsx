"use client";

import { GatewayLanguageModelEntry } from "@ai-sdk/gateway";
import { useMemo } from "react";
import { toast } from "react-toastify";
import { Label } from "@/components/ui/label";
import {
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
} from "@/components/ai-elements/prompt-input";
import { getFeaturedModelConfig } from "@/lib/ai/featuredModels";
import { isFreeModel } from "@/lib/ai/isFreeModel";
import { organizeModels } from "@/lib/ai/organizeModels";
import { DEFAULT_MODEL } from "@/lib/consts";
import { usePaymentProvider } from "@/providers/PaymentProvider";
import ModelSelectList from "./ModelSelectList";
import ModelSelectMaintenance from "./ModelSelectMaintenance";

const DEFAULT_OPTION = "__default__";

type GatewayModelSelectProps = {
  value: string;
  onValueChange: (modelId: string) => void;
  availableModels: GatewayLanguageModelEntry[];
  disabled?: boolean;
  isLoading?: boolean;
  isError?: boolean;
  /** When set, renders a form-labeled wrapper with this label text. */
  label?: string;
  /** Id applied to the trigger so a label's htmlFor / aria-describedby can target it. */
  triggerId?: string;
  /** Id applied to the hint text; also sets aria-describedby on the trigger. */
  hintId?: string;
  /** When true, adds a "Use default model" first row that resolves to an empty string. */
  includeDefaultOption?: boolean;
};

export function GatewayModelSelect({
  value,
  onValueChange,
  availableModels,
  disabled = false,
  isLoading = false,
  isError = false,
  label,
  triggerId,
  hintId,
  includeDefaultOption = false,
}: GatewayModelSelectProps) {
  const { isSubscribed } = usePaymentProvider();
  const hasModels = availableModels.length > 0;

  const organized = useMemo(
    () => organizeModels(availableModels),
    [availableModels],
  );

  const defaultModelLabel = useMemo(() => {
    const configured = availableModels.find((m) => m.id === DEFAULT_MODEL);
    return configured?.name
      ? `${configured.name} (${DEFAULT_MODEL})`
      : DEFAULT_MODEL;
  }, [availableModels]);

  const selectedModel = availableModels.find((m) => m.id === value);
  const displayName =
    getFeaturedModelConfig(value)?.displayName ||
    selectedModel?.name ||
    value ||
    "";

  const selectValue = includeDefaultOption ? value || DEFAULT_OPTION : value;

  const handleChange = (next: string) => {
    const normalized =
      includeDefaultOption && next === DEFAULT_OPTION ? "" : next;

    if (normalized) {
      const model = availableModels.find((m) => m.id === normalized);
      if (model && !isFreeModel(model) && !isSubscribed) {
        toast.error(
          "This model is not free. Please upgrade to a paid plan or select a free model.",
        );
        return;
      }
    }

    onValueChange(normalized);
  };

  const select = (
    <PromptInputModelSelect
      value={selectValue}
      onValueChange={hasModels ? handleChange : undefined}
      disabled={disabled || isLoading}
    >
      <PromptInputModelSelectTrigger
        {...(triggerId ? { id: triggerId } : {})}
        {...(includeDefaultOption && hintId
          ? { "aria-describedby": hintId }
          : {})}
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
        {hasModels ? (
          <>
            {includeDefaultOption ? (
              <PromptInputModelSelectItem
                value={DEFAULT_OPTION}
                className="py-3"
              >
                <span className="font-semibold text-sm text-foreground dark:text-white">
                  Use default model ({defaultModelLabel})
                </span>
              </PromptInputModelSelectItem>
            ) : null}
            <ModelSelectList
              featuredModels={organized.featuredModels}
              otherModels={organized.otherModels}
            />
          </>
        ) : (
          <ModelSelectMaintenance />
        )}
      </PromptInputModelSelectContent>
    </PromptInputModelSelect>
  );

  if (!label) {
    return select;
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={triggerId}>{label}</Label>
      {select}
      {includeDefaultOption && hintId ? (
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
