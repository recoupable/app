import {
  PromptInputModelSelect,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
} from "../ai-elements/prompt-input";
import { PromptInputModelSelectContent } from "../ai-elements/prompt-input";
import { useVercelChatContext } from "@/providers/VercelChatProvider";
import { isFreeModel } from "@/lib/ai/isFreeModel";
import { toast } from "react-toastify";
import ModelSelectItem from "./ModelSelectItem";
import { usePaymentProvider } from "@/providers/PaymentProvider";
import { organizeModels } from "@/lib/ai/organizeModels";
import { getFeaturedModelConfig } from "@/lib/ai/featuredModels";
import { DEFAULT_MODEL } from "@/lib/consts";
import { useMemo } from "react";

const ModelSelect = () => {
  const { model, setModel, availableModels } = useVercelChatContext();
  const { isSubscribed } = usePaymentProvider();

  const organizedModels = useMemo(() => {
    return organizeModels(availableModels);
  }, [availableModels]);

  const selectedModel = availableModels.find(m => m.id === model);
  const selectedModelConfig = getFeaturedModelConfig(model);

  const defaultModelConfig = getFeaturedModelConfig(DEFAULT_MODEL);
  const defaultDisplayName = defaultModelConfig?.displayName || DEFAULT_MODEL;

  const displayName = organizedModels.hasGatewayModels
    ? (selectedModelConfig?.displayName || selectedModel?.name || defaultDisplayName)
    : defaultDisplayName;

  const handleModelChange = (value: string) => {
    const selectedModel = availableModels.find((m) => m.id === value);
    const isModelFree = selectedModel ? isFreeModel(selectedModel) : false;
    if (!isModelFree && !isSubscribed) {
      toast.error(
        "This model is not free. Please upgrade to a paid plan or select a free model."
      );
      return;
    }
    setModel(value);
  };

  return (
    <PromptInputModelSelect
      onValueChange={organizedModels.hasGatewayModels ? handleModelChange : undefined}
      value={model}
    >
      <PromptInputModelSelectTrigger>
        <PromptInputModelSelectValue placeholder="Select a model">
          {displayName}
        </PromptInputModelSelectValue>
      </PromptInputModelSelectTrigger>
      <PromptInputModelSelectContent>
        {organizedModels.hasGatewayModels ? (
          <>
            {organizedModels.featuredModels.map((model) => (
              <ModelSelectItem key={model.id} model={model} />
            ))}

            {organizedModels.otherModels.length > 0 && (
              <>
                {organizedModels.featuredModels.length > 0 && (
                  <div className="my-1 h-px bg-border" />
                )}
                <div className="px-3 py-2.5 text-sm font-medium text-muted-foreground">
                  More Models
                </div>
                {organizedModels.otherModels.map((model) => (
                  <ModelSelectItem key={model.id} model={model} />
                ))}
              </>
            )}
          </>
        ) : (
          <div className="flex items-start gap-2.5 px-3 py-3">
            <div className="mt-1 h-1.5 w-1.5 rounded-full bg-[#345A5D] animate-pulse shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Model Maintenance</span>
              <br />
              Selection is temporarily unavailable. Keep chatting and check back shortly!
            </p>
          </div>
        )}
      </PromptInputModelSelectContent>
    </PromptInputModelSelect>
  );
};

export default ModelSelect;
