import supabase from "@/lib/supabase/serverClient";

/**
 *
 * @param templateId
 * @param userId
 */
export async function removeAgentTemplateFavorite(templateId: string, userId: string) {
  const { error } = await supabase
    .from("agent_template_favorites")
    .delete()
    .eq("template_id", templateId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return { success: true } as const;
}
