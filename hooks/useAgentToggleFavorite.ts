import { useUserProvider } from "@/providers/UserProvder";
import { usePrivy } from "@privy-io/react-auth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import toggleAgentTemplateFavorite from "@/lib/agent-templates/toggleAgentTemplateFavorite";

export function useAgentToggleFavorite() {
  const { userData } = useUserProvider();
  const { getAccessToken } = usePrivy();
  const queryClient = useQueryClient();

  const handleToggleFavorite = async (
    templateId: string,
    nextFavourite: boolean,
  ) => {
    if (!userData?.id || !templateId) return;

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("Not authenticated");

      await toggleAgentTemplateFavorite(accessToken, templateId, nextFavourite);

      toast.success(
        nextFavourite ? "Added to favorites" : "Removed from favorites",
      );

      queryClient.invalidateQueries({ queryKey: ["agent-templates"] });
    } catch {
      toast.error("Failed to update favorite");
    }
  };

  return {
    handleToggleFavorite,
  };
}
