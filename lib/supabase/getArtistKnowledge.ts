import supabase from "./serverClient";

export interface KnowledgeBaseEntry {
  url: string;
  name: string;
  type: string;
}

/**
 *
 * @param artistId
 */
export async function getArtistKnowledge(artistId: string): Promise<KnowledgeBaseEntry[]> {
  const { data, error } = await supabase
    .from("account_info")
    .select("knowledges")
    .eq("account_id", artistId)
    .single();

  return error || !data?.knowledges ? [] : data.knowledges;
}

export default getArtistKnowledge;
