import supabase from "@/lib/supabase/serverClient";

/**
 *
 * @param templateId
 * @param userId
 */
export async function addAgentTemplateFavorite(templateId: string, userId: string) {
  const { error } = await supabase
    .from("agent_template_favorites")
    .insert({ template_id: templateId, user_id: userId })
    .select("template_id")
    .maybeSingle();

  if (error && error.code !== "23505") {
    throw error; // ignore unique violation
  }

  return { success: true } as const;
}
