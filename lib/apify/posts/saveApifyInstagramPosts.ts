import insertPosts from "@/lib/supabase/posts/insertPosts";
import getPosts from "@/lib/supabase/posts/getPosts";
import { ApifyInstagramPost } from "@/types/Apify";
import { TablesInsert, Tables } from "@/types/database.types";

/**
 * Saves an array of ApifyInstagramPost to Supabase and returns the save result and the posts from Supabase.
 *
 * @param apifyPosts - Array of ApifyInstagramPost
 * @returns An object with saveResult and supabasePosts
 */
export default async function saveApifyInstagramPosts(apifyPosts: ApifyInstagramPost[]) {
  const posts: TablesInsert<"posts">[] = apifyPosts.map(post => ({
    post_url: post.url,
    updated_at: post.timestamp,
  }));
  const postUrls = posts.map(post => post.post_url);
  await insertPosts(posts);
  const supabasePosts: Tables<"posts">[] = await getPosts(postUrls);
  return { supabasePosts };
}
