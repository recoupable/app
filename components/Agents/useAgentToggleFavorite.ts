import { toast } from "sonner";
import { useAgentTemplateMutation } from "./useAgentTemplateMutation";

export function useAgentToggleFavorite() {
  const mutation = useAgentTemplateMutation();
  return {
    handleToggleFavorite: async (
      templateId: string,
      nextFavourite: boolean,
    ) => {
      if (!templateId) return;
      await mutation.mutate(
        {
          path: `/${encodeURIComponent(templateId)}/favorite`,
          method: "PUT",
          body: { is_favourite: nextFavourite },
        },
        () => {
          toast.success(
            nextFavourite ? "Added to favorites" : "Removed from favorites",
          );
        },
      );
    },
  };
}
