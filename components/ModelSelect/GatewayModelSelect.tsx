"use client";

import { useMemo } from "react";
import { toast } from "react-toastify";
import {
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
} from "@/components/ai-elements/prompt-input";
import useAvailableModels from "@/hooks/useAvailableModels";
import { getFeaturedModelConfig } from "@/lib/ai/featuredModels";
import { isFreeModel } from "@/lib/ai/isFreeModel";
import { organizeModels } from "@/lib/ai/organizeModels";
import { usePaymentProvider } from "@/providers/PaymentProvider";
import ModelSelectList from "./ModelSelectList";
import ModelSelectMaintenance from "./ModelSelectMaintenance";

type GatewayModelSelectProps = {
  value: string;
  onValueChange: (modelId: string) => void;
};

export function GatewayModelSelect({
  value,
  onValueChange,
}: GatewayModelSelectProps) {
  const { data: availableModels = [], isLoading } = useAvailableModels();
  const { isSubscribed } = usePaymentProvider();
  const hasModels = availableModels.length > 0;

  const organized = useMemo(
    () => organizeModels(availableModels),
    [availableModels],
  );

  const selectedModel = availableModels.find((m) => m.id === value);
  const displayName =
    getFeaturedModelConfig(value)?.displayName ||
    selectedModel?.name ||
    value ||
    "";

  const handleChange = (next: string) => {
    const model = availableModels.find((m) => m.id === next);
    if (model && !isFreeModel(model) && !isSubscribed) {
      toast.error(
        "This model is not free. Please upgrade to a paid plan or select a free model.",
      );
      return;
    }
    onValueChange(next);
  };

  return (
    <PromptInputModelSelect
      value={value}
      onValueChange={hasModels ? handleChange : undefined}
      disabled={isLoading}
    >
      <PromptInputModelSelectTrigger>
        <PromptInputModelSelectValue placeholder="Select a model">
          {displayName}
        </PromptInputModelSelectValue>
      </PromptInputModelSelectTrigger>
      <PromptInputModelSelectContent>
        {hasModels ? (
          <ModelSelectList
            featuredModels={organized.featuredModels}
            otherModels={organized.otherModels}
          />
        ) : (
          <ModelSelectMaintenance />
        )}
      </PromptInputModelSelectContent>
    </PromptInputModelSelect>
  );
}
