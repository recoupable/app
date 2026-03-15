import insertPosts from "@/lib/supabase/posts/insertPosts";
import getPosts from "@/lib/supabase/posts/getPosts";
import { TablesInsert, Tables } from "@/types/database.types";

/**
 * Gets or creates posts for the given post URLs and returns them as a map
 *
 * @param postUrls - Array of post URLs from Instagram comments
 * @returns Map of post URL to post record
 */
export default async function getOrCreatePostsForComments(
  postUrls: string[],
): Promise<Map<string, Tables<"posts">>> {
  const uniquePostUrls = Array.from(new Set(postUrls));

  // First, try to get existing posts
  const existingPosts = await getPosts(uniquePostUrls);
  const existingPostUrls = new Set(existingPosts.map(post => post.post_url));

  // Identify which posts need to be created
  const missingPostUrls = uniquePostUrls.filter(url => !existingPostUrls.has(url));

  if (missingPostUrls.length > 0) {
    // Create posts for missing URLs
    const postsToInsert: TablesInsert<"posts">[] = missingPostUrls.map(url => ({
      post_url: url,
      updated_at: new Date().toISOString(),
    }));

    await insertPosts(postsToInsert);
  }

  // Get all posts (existing + newly created)
  const allPosts = await getPosts(uniquePostUrls);

  // Return as a map for easy lookup
  const postMap = new Map<string, Tables<"posts">>();
  allPosts.forEach(post => {
    postMap.set(post.post_url, post);
  });

  return postMap;
}
