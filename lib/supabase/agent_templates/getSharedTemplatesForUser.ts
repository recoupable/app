import supabase from "@/lib/supabase/serverClient";
import type { AgentTemplateRow } from "@/types/AgentTemplates";
import getAccountEmails from "@/lib/supabase/account_emails/getAccountEmails";

interface SharedTemplateData {
  templates: AgentTemplateRow | AgentTemplateRow[];
}

export async function getSharedTemplatesForUser(userId: string): Promise<AgentTemplateRow[]> {
  const { data, error } = await supabase
    .from("agent_template_shares")
    .select(`
      templates:agent_templates(
        id, title, description, prompt, tags, creator, is_private, created_at, favorites_count, updated_at
      )
    `)
    .eq("user_id", userId);

  if (error) throw error;

  const templates: AgentTemplateRow[] = [];
  const processedIds = new Set<string>();

  data?.forEach((share: SharedTemplateData) => {
    if (!share || !share.templates) return;

    // Handle both single template and array of templates
    const templateList = Array.isArray(share.templates)
      ? share.templates
      : [share.templates];

    templateList?.forEach((template: AgentTemplateRow) => {
      if (template && template.id && !processedIds.has(template.id)) {
        templates.push(template);
        processedIds.add(template.id);
      }
    });
  });

  const accountEmails = await getAccountEmails(userId);
  const emailAddresses = accountEmails
    .map((row) => row.email)
    .filter((email): email is string => typeof email === "string" && email.length > 0);

  if (emailAddresses.length === 0) {
    return templates;
  }

  const { data: emailShareData, error: emailShareError } = await supabase
    .from("agent_template_email_shares")
    .select(`
      templates:agent_templates(
        id, title, description, prompt, tags, creator, is_private, created_at, favorites_count, updated_at
      )
    `)
    .in("email", emailAddresses);

  if (emailShareError) {
    throw emailShareError;
  }

  emailShareData?.forEach((share: SharedTemplateData) => {
    if (!share || !share.templates) return;

    const templateList = Array.isArray(share.templates)
      ? share.templates
      : [share.templates];

    templateList?.forEach((template: AgentTemplateRow) => {
      if (template && template.id && !processedIds.has(template.id)) {
        templates.push(template);
        processedIds.add(template.id);
      }
    });
  });

  return templates;
}
