import { useUserProvider } from "@/providers/UserProvder";
import { usePrivy } from "@privy-io/react-auth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import type { ToggleFavoriteResponse } from "@/types/AgentTemplates";

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
        `${getClientApiBaseUrl()}/api/agents/templates/${templateId}/favorite`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ is_favourite: nextFavourite }),
        },
      );

      const data = (await res
        .json()
        .catch(() => null)) as ToggleFavoriteResponse | null;

      if (!res.ok || data?.status !== "success") {
        throw new Error(
          (data?.status === "error" && data.error) ||
            "Failed to toggle favorite",
        );
      }

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
