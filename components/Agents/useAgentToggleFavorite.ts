import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ToggleFavoriteRequest } from "@/types/AgentTemplates";

export function useAgentToggleFavorite() {
  const queryClient = useQueryClient();

  const handleToggleFavorite = async (
    templateId: string,
    nextFavourite: boolean
  ) => {
    if (!templateId) return;
    
    try {
      const body: ToggleFavoriteRequest = {
        templateId,
        isFavourite: nextFavourite,
      };
      const res = await fetch("/api/agent-templates/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      
      if (!res.ok) {
        throw new Error("Failed to toggle favorite");
      }
      
      toast.success(
        nextFavourite ? "Added to favorites" : "Removed from favorites"
      );
      
      // Invalidate templates list so is_favourite and favorites_count refresh
      queryClient.invalidateQueries({ queryKey: ["agent-templates"] });
    } catch {
      toast.error("Failed to update favorite");
    }
  };

  return {
    handleToggleFavorite,
  };
}
