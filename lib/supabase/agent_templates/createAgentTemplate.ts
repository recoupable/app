import supabase from "@/lib/supabase/serverClient";
import { createAgentTemplateShares } from "./createAgentTemplateShares";

/**
 *
 * @param params
 * @param params.title
 * @param params.description
 * @param params.prompt
 * @param params.tags
 * @param params.isPrivate
 * @param params.shareEmails
 * @param params.userId
 */
export async function createAgentTemplate(params: {
  title: string;
  description: string;
  prompt: string;
  tags: string[];
  isPrivate: boolean;
  shareEmails?: string[];
  userId?: string | null;
}) {
  const { data, error } = await supabase
    .from("agent_templates")
    .insert({
      title: params.title,
      description: params.description,
      prompt: params.prompt,
      tags: params.tags,
      is_private: params.isPrivate,
      creator: params.userId ?? null,
    })
    .select(
      "id, title, description, prompt, tags, creator, is_private, created_at, favorites_count",
    )
    .single();
  if (error) throw error;

  // Handle email sharing if agent is private and emails are provided
  if (params.isPrivate && params.shareEmails && params.shareEmails.length > 0) {
    await createAgentTemplateShares(data.id, params.shareEmails);
  }

  return data;
}
