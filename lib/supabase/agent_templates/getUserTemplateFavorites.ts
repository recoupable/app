import supabase from "@/lib/supabase/serverClient";

interface TemplateFavorite {
  template_id: string;
}

/**
 *
 * @param userId
 */
export async function getUserTemplateFavorites(userId: string): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("agent_template_favorites")
    .select("template_id")
    .eq("user_id", userId);

  if (error) throw error;

  return new Set<string>((data || []).map((f: TemplateFavorite) => f.template_id));
}
