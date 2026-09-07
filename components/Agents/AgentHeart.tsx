import type React from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AgentHeartProps {
  isFavorited: boolean;
  onToggle: () => void;
  className?: string;
}

const AgentHeart: React.FC<AgentHeartProps> = ({
  isFavorited,
  onToggle,
  className,
}) => {
  return (
    <Button
      size="sm"
      variant="ghost"
      className={cn(
        "h-8 w-8 p-0 bg-transparent rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20",
        className,
      )}
      onClick={(e) => {
        e.stopPropagation(); // Prevent card click when heart is clicked
        onToggle();
      }}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-colors",
          isFavorited
            ? "fill-red-500 text-red-500"
            : "text-muted-foreground hover:text-red-400",
        )}
      />
    </Button>
  );
};

export default AgentHeart;
