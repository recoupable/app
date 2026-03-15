import supabase from "@/lib/supabase/serverClient";
import { TablesInsert } from "@/types/database.types";

/**
 * Saves an array of posts to the Supabase 'posts' table.
 * Uses upsert to avoid errors on duplicate post_url (unique constraint).
 *
 * @param posts - Array of posts matching the posts table insert type.
 * @returns The result of the Supabase upsert operation.
 */
export default async function insertPosts(posts: TablesInsert<"posts">[]) {
  const { data, error } = await supabase
    .from("posts")
    .upsert(posts, { onConflict: "post_url", ignoreDuplicates: true });
  return { data, error };
}
