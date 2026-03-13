import supabase from "../serverClient";
import type { TablesInsert } from "@/types/database.types";

/**
 * Creates records in the social_posts table.
 * Uses upsert to avoid unique constraint violation on (post_id, social_id).
 *
 * @param socialPosts - Array of rows to insert.
 * @returns Supabase upsert result
 */
export default async function insertSocialPosts(socialPosts: TablesInsert<"social_posts">[]) {
  const { data, error } = await supabase
    .from("social_posts")
    .upsert(socialPosts, { onConflict: "post_id,social_id" });
  return { data, error };
}
