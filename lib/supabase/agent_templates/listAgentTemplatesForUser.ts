import supabase from "@/lib/supabase/serverClient";

/**
 *
 * @param userId
 */
export async function listAgentTemplatesForUser(userId?: string | null) {
  if (userId && userId !== "undefined") {
    const { data, error } = await supabase
      .from("agent_templates")
      .select(
        "id, title, description, prompt, tags, creator, is_private, created_at, favorites_count, updated_at",
      )
      .or(`creator.eq.${userId},is_private.eq.false`)
      .order("title");
    if (error) throw error;
    return data ?? [];
  }

  const { data, error } = await supabase
    .from("agent_templates")
    .select(
      "id, title, description, prompt, tags, creator, is_private, created_at, favorites_count, updated_at",
    )
    .eq("is_private", false)
    .order("title");
  if (error) throw error;
  return data ?? [];
}
