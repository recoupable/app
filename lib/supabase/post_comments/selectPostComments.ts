import serverClient from "../serverClient";
import { Tables } from "@/types/database.types";
import getPosts from "@/lib/supabase/posts/getPosts";

export type PostComment = Tables<"post_comments"> & {
  post?: Tables<"posts">;
  social?: Tables<"socials">;
};

interface SelectPostCommentsParams {
  postUrls?: string[];
}

export const selectPostComments = async (
  params?: SelectPostCommentsParams,
): Promise<PostComment[]> => {
  let query = serverClient.from("post_comments").select(`
    *,
    post:posts(*),
    social:socials(*)
  `);

  if (params?.postUrls && params.postUrls.length > 0) {
    // First get post IDs for the given URLs
    const posts = await getPosts(params.postUrls);

    if (posts.length > 0) {
      const postIds = posts.map(post => post.id);
      query = query.in("post_id", postIds);
    } else {
      // If no posts found for the URLs, return empty array
      return [];
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error selecting post comments:", error);
    throw error;
  }

  return data || [];
};

export default selectPostComments;
