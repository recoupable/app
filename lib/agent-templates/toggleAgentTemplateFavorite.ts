import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import type { ToggleFavoriteResponse } from "@/types/AgentTemplates";

const toggleAgentTemplateFavorite = async (
  accessToken: string,
  templateId: string,
  isFavourite: boolean,
): Promise<void> => {
  const res = await fetch(
    `${getClientApiBaseUrl()}/api/agents/templates/${templateId}/favorite`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ is_favourite: isFavourite }),
    },
  );

  const data = (await res
    .json()
    .catch(() => null)) as ToggleFavoriteResponse | null;

  if (!res.ok || data?.status !== "success") {
    throw new Error(
      (data?.status === "error" && data.error) || "Failed to toggle favorite",
    );
  }
};

export default toggleAgentTemplateFavorite;
