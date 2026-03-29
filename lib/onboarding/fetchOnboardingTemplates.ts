import supabase from "@/lib/supabase/serverClient";
import type { AgentTemplateRow } from "@/types/AgentTemplates";

/**
 * Fetches all onboarding templates from the agent_templates table.
 * Onboarding templates are identified by having 'onboarding' in their tags array.
 * These are system templates (creator = NULL) available to all users.
 */
export async function fetchOnboardingTemplates(): Promise<AgentTemplateRow[]> {
  const { data, error } = await supabase
    .from("agent_templates")
    .select("id, title, description, prompt, tags, creator, is_private, created_at, favorites_count, updated_at")
    .contains("tags", ["onboarding"])
    .eq("is_private", false)
    .is("creator", null)
    .order("title");

  if (error) {
    throw error;
  }

  return data || [];
}

export default fetchOnboardingTemplates;
