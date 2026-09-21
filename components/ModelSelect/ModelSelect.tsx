import {
  PromptInputModelSelect,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
} from "../ai-elements/prompt-input";
import { PromptInputModelSelectContent } from "../ai-elements/prompt-input";
import { useVercelChatContext } from "@/providers/VercelChatProvider";
import { isFreeModel } from "@/lib/ai/isFreeModel";
import { toast } from "react-toastify";
import { usePaymentProvider } from "@/providers/PaymentProvider";
import { organizeModels } from "@/lib/ai/organizeModels";
import { getFeaturedModelConfig } from "@/lib/ai/featuredModels";
import { useMemo } from "react";
import ModelSelectList from "./ModelSelectList";
import ModelSelectMaintenance from "./ModelSelectMaintenance";

const ModelSelect = () => {
  const { model, setModel, availableModels } = useVercelChatContext();
  const { isSubscribed } = usePaymentProvider();

  const organizedModels = useMemo(() => {
    return organizeModels(availableModels);
  }, [availableModels]);

  const selectedModel = availableModels.find((m) => m.id === model);
  const displayName =
    model === "auto"
      ? "Auto · Jev"
      : getFeaturedModelConfig(model)?.displayName ||
        selectedModel?.name ||
        model;

  const hasModels = availableModels.length > 0;

  const handleModelChange = (value: string) => {
    const selectedModel = availableModels.find((m) => m.id === value);
    const isModelFree = selectedModel ? isFreeModel(selectedModel) : false;
    if (!isModelFree && !isSubscribed) {
      toast.error(
        "This model is not free. Please upgrade to a paid plan or select a free model.",
      );
      return;
    }
    setModel(value);
  };

  return (
    <PromptInputModelSelect onValueChange={handleModelChange} value={model}>
      <PromptInputModelSelectTrigger>
        <PromptInputModelSelectValue placeholder="Select a model">
          {displayName}
        </PromptInputModelSelectValue>
      </PromptInputModelSelectTrigger>
      <PromptInputModelSelectContent>
        <PromptInputModelSelectItem value="auto" className="py-3">
          <div>
            <div className="text-sm font-semibold">Auto · Jev</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Chooses a model for each request · Paid plan
            </div>
          </div>
        </PromptInputModelSelectItem>
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
