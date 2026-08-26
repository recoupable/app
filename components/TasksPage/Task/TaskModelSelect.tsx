import { useMemo } from "react";
import {
  PromptInputModelSelect,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputModelSelectContent,
} from "@/components/ai-elements/prompt-input";
import ModelSelectItem from "@/components/ModelSelect/ModelSelectItem";
import { getFeaturedModelConfig } from "@/lib/ai/featuredModels";
import { organizeModels } from "@/lib/ai/organizeModels";
import useAvailableModels from "@/hooks/useAvailableModels";

interface TaskModelSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

/** Model picker for the task page: featured models first, then the rest. */
const TaskModelSelect = ({ value, onValueChange }: TaskModelSelectProps) => {
  const { data: availableModels = [] } = useAvailableModels();
  const organizedModels = useMemo(
    () => organizeModels(availableModels),
    [availableModels],
  );
  const displayName =
    getFeaturedModelConfig(value)?.displayName ||
    availableModels.find((m) => m.id === value)?.name ||
    value;

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-foreground">Model</label>
      <PromptInputModelSelect value={value} onValueChange={onValueChange}>
        <PromptInputModelSelectTrigger>
          <PromptInputModelSelectValue placeholder="Select a model">
            {displayName}
          </PromptInputModelSelectValue>
        </PromptInputModelSelectTrigger>
        <PromptInputModelSelectContent>
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
        </PromptInputModelSelectContent>
      </PromptInputModelSelect>
    </div>
  );
};

export default TaskModelSelect;
