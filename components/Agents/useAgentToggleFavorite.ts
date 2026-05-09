import { useUserProvider } from "@/providers/UserProvder";
import { usePrivy } from "@privy-io/react-auth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

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

      const res = await fetch(
        `${getClientApiBaseUrl()}/api/agent-templates/${templateId}/favorite`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ is_favourite: nextFavourite }),
        },
      );

      if (!res.ok) {
        throw new Error("Failed to toggle favorite");
      }

      toast.success(
        nextFavourite ? "Added to favorites" : "Removed from favorites",
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
