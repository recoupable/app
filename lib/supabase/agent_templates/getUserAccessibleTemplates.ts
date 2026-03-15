import type { AgentTemplateRow } from "@/types/AgentTemplates";
import { listAgentTemplatesForUser } from "./listAgentTemplatesForUser";
import { getSharedTemplatesForUser } from "./getSharedTemplatesForUser";
import { getUserTemplateFavorites } from "./getUserTemplateFavorites";

/**
 *
 * @param userId
 */
export async function getUserAccessibleTemplates(userId?: string | null) {
  if (userId && userId !== "undefined") {
    // Get owned and public templates
    const ownedAndPublic = await listAgentTemplatesForUser(userId);

    // Get shared templates using dedicated utility
    const sharedTemplates = await getSharedTemplatesForUser(userId);

    // Combine templates and avoid duplicates
    const allTemplates = [...ownedAndPublic];
    const templateIds = new Set(ownedAndPublic.map(t => t.id));

    sharedTemplates.forEach(template => {
      if (!templateIds.has(template.id)) {
        allTemplates.push(template);
        templateIds.add(template.id);
      }
    });

    // Get user's favorite templates
    const favouriteIds = await getUserTemplateFavorites(userId);

    // Mark favorites
    return allTemplates.map((template: AgentTemplateRow) => ({
      ...template,
      is_favourite: favouriteIds.has(template.id),
    }));
  }

  // For anonymous users, return public templates only
  const publicTemplates = await listAgentTemplatesForUser(null);
  return publicTemplates.map((template: AgentTemplateRow) => ({
    ...template,
    is_favourite: false,
  }));
}
