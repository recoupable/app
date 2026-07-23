import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAgentData } from "./useAgentData";
import { CreateAgentFormData } from "./schemas";

interface TagSelectorProps {
  form: UseFormReturn<CreateAgentFormData>;
}

const TagSelector = ({ form }: TagSelectorProps) => {
  const { tags } = useAgentData();
  const availableTags = tags.filter((tag) => tag !== "Recommended");
  const selectedTags = form.watch("tags") ?? [];

  const toggleTag = (tag: string) => {
    const current = form.getValues("tags") ?? [];
    const next = current.includes(tag)
      ? current.filter((t: string) => t !== tag)
      : [...current, tag];
    form.setValue("tags", next, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="tags">Category</Label>
      <div className="flex flex-wrap gap-2" id="tags">
        {availableTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <Badge
              key={tag}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              onClick={() => toggleTag(tag)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleTag(tag);
                }
              }}
              className={
                isSelected
                  ? "cursor-pointer select-none rounded-full focus:ring-0"
                  : "cursor-pointer select-none rounded-full bg-transparent border-border text-muted-foreground hover:bg-muted focus:ring-0"
              }
              variant={isSelected ? "default" : "outline"}
            >
              {tag}
            </Badge>
          );
        })}
      </div>
      {form.formState.errors.tags && (
        <p className="text-sm text-red-500">
          {form.formState.errors.tags.message as string}
        </p>
      )}
    </div>
  );
};

export default TagSelector;
