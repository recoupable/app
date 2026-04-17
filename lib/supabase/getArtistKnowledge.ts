import supabase from "./serverClient";
import type { Knowledge } from "@/types/knowledge";

export type KnowledgeBaseEntry = Knowledge;

export async function getArtistKnowledge(artistId: string): Promise<Knowledge[]> {
  const { data, error } = await supabase
    .from("account_info")
    .select("knowledges")
    .eq("account_id", artistId)
    .single();

  return error || !data?.knowledges ? [] : data.knowledges;
}

export default getArtistKnowledge;
