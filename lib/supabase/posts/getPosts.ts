import supabase from "@/lib/supabase/serverClient";
import { Tables } from "@/types/database.types";

/**
 *
 * @param postUrls
 */
export default async function getPosts(postUrls: string[]): Promise<Tables<"posts">[]> {
  if (!Array.isArray(postUrls) || postUrls.length === 0) return [];
  const { data, error } = await supabase.from("posts").select("*").in("post_url", postUrls);
  if (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
  return data || [];
}
