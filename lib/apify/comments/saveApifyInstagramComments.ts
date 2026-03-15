import { insertPostComments } from "@/lib/supabase/post_comments/insertPostComments";
import getOrCreatePostsForComments from "@/lib/apify/comments/getOrCreatePostsForComments";
import getOrCreateSocialsForComments from "@/lib/apify/comments/getOrCreateSocialsForComments";
import { TablesInsert } from "@/types/database.types";
import { InstagramComment } from "@/lib/apify/comments/handleInstagramCommentsScraper";

/**
 * Saves Instagram comments to the post_comments table in the database
 *
 * @param comments - Array of Instagram comments to save
 * @returns Promise that resolves when comments are saved
 */
export default async function saveApifyInstagramComments(
  comments: InstagramComment[],
): Promise<void> {
  if (comments.length === 0) {
    return;
  }

  try {
    console.log(`Saving ${comments.length} comments to database...`);

    // Get or create posts for the comment URLs
    const postUrls = Array.from(new Set(comments.map(comment => comment.postUrl).filter(Boolean)));
    const postsMap = await getOrCreatePostsForComments(postUrls);

    // Get or create socials for the comment authors
    const socialsMap = await getOrCreateSocialsForComments(comments);

    // Map Instagram comments to post_comments table format
    const postCommentsToInsert: TablesInsert<"post_comments">[] = [];

    for (const comment of comments) {
      if (!comment.postUrl || !comment.ownerUsername) {
        continue;
      }

      const post = postsMap.get(comment.postUrl);
      const social = socialsMap.get(comment.ownerUsername);

      if (!post || !social) {
        console.warn(`Missing post or social for comment: ${comment.id}`);
        continue;
      }

      postCommentsToInsert.push({
        post_id: post.id,
        social_id: social.id,
        comment: comment.text,
        commented_at: comment.timestamp,
      });
    }

    if (postCommentsToInsert.length > 0) {
      await insertPostComments(postCommentsToInsert);
      console.log(`Successfully saved ${postCommentsToInsert.length} comments to database`);
    } else {
      console.warn("No valid comments to save to database");
    }
  } catch (error) {
    console.error("Error saving comments to database:", error);
  }
}
