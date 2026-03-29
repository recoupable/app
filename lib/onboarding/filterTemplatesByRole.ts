import type { AgentTemplateRow } from "@/types/AgentTemplates";
import type { UserRole } from "@/hooks/useOnboarding";

/**
 * Filters onboarding templates by the user's role.
 * Templates are tagged with role:manager, role:artist, role:label, etc.
 * This function returns templates that match the user's role tag.
 *
 * If role is null or 'other', returns all templates (no role filtering).
 */
export function filterTemplatesByRole(
  templates: AgentTemplateRow[],
  role: UserRole
): AgentTemplateRow[] {
  // If no role or 'other', return all templates
  if (!role || role === "other") {
    return templates;
  }

  const roleTag = `role:${role}`;

  return templates.filter((template) => {
    if (!template.tags) {
      return false;
    }
    return template.tags.includes(roleTag);
  });
}

export default filterTemplatesByRole;
