import {
  PromptInputModelSelect,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
} from "../ai-elements/prompt-input";
import { PromptInputModelSelectContent } from "../ai-elements/prompt-input";
import { useVercelChatContext } from "@/providers/VercelChatProvider";
import { isPremiumModel } from "@/lib/ai/isPremiumModel";
import { dedupeModels } from "@/lib/ai/dedupeModels";
import { toast } from "react-toastify";
import { usePaymentProvider } from "@/providers/PaymentProvider";
import useSubscribeClick from "@/hooks/useSubscribeClick";
import { organizeModels } from "@/lib/ai/organizeModels";
import { getFeaturedModelConfig } from "@/lib/ai/featuredModels";
import { useMemo } from "react";
import ModelSelectList from "./ModelSelectList";
import ModelSelectMaintenance from "./ModelSelectMaintenance";

const ModelSelect = () => {
  const { model, setModel, availableModels } = useVercelChatContext();
  const { isSubscribed } = usePaymentProvider();
  const { handleClick: handleSubscribeClick } = useSubscribeClick();

  const organizedModels = useMemo(() => {
    return organizeModels(dedupeModels(availableModels));
  }, [availableModels]);

  const selectedModel = availableModels.find((m) => m.id === model);
  const displayName =
    getFeaturedModelConfig(model)?.displayName || selectedModel?.name || model;

  const hasModels = availableModels.length > 0;

  const handleModelChange = (value: string) => {
    const selectedModel = availableModels.find((m) => m.id === value);
    const isPremium = selectedModel ? isPremiumModel(selectedModel) : true;
    if (isPremium && !isSubscribed) {
      toast.info("Upgrade to Pro to use this model.");
      handleSubscribeClick();
      return;
    }
    setModel(value);
  };

  return (
    <PromptInputModelSelect
      onValueChange={hasModels ? handleModelChange : undefined}
      value={model}
    >
      <PromptInputModelSelectTrigger>
        <PromptInputModelSelectValue placeholder="Select a model">
          {displayName}
        </PromptInputModelSelectValue>
      </PromptInputModelSelectTrigger>
      <PromptInputModelSelectContent>
        {hasModels ? (
          <ModelSelectList
            featuredModels={organizedModels.featuredModels}
            otherModels={organizedModels.otherModels}
          />
        ) : (
          <ModelSelectMaintenance />
        )}
      </PromptInputModelSelectContent>
    </PromptInputModelSelect>
  );
};

export default ModelSelect;
