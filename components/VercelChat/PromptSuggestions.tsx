import { Button } from "@/components/ui/button";
import usePromptSuggestions from "@/hooks/usePromptSuggestions";
import SkeletonShimmer from "@/components/ui/SkeletonShimmer";
import PromptIcon from "./PromptIcon";

const PromptSuggestions = () => {
  const { handleSuggestionClick, isLoading, suggestions, isHidden } =
    usePromptSuggestions();

  if (isHidden) return null;

  return (
    <div className="prompt-suggestions pointer-events-none w-full bg-transparent rounded-lg absolute top-[-2.7rem] left-0 right-0 mx-auto no-scrollbar pb-2">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-[0.8rem] bg-transparent">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <SkeletonShimmer
              key={`skeleton-${index}`}
              className="pointer-events-auto h-8 px-3 flex-shrink-0 rounded-full bg-muted/50 border border-border/50 w-[120px] md:w-[200px] animate-pulse overflow-hidden"
            />
          ))
        ) : (
          suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleSuggestionClick(suggestion.text)}
              className="pointer-events-auto text-xs h-8 px-3 flex-shrink-0 rounded-full bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-300 border border-border"
            >
              <PromptIcon type={suggestion.type} />
              {suggestion.text}
            </Button>
          ))
        )}
      </div>
    </div>
  );
};

export default PromptSuggestions;
