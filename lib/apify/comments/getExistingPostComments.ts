import { selectPostComments, PostComment } from "@/lib/supabase/post_comments/selectPostComments";

/**
 * Gets existing post comments for the provided post URLs
 *
 * @param postUrls - Array of Instagram post URLs to check for existing comments
 * @returns Promise with array of existing post comments and helper arrays
 */
export default async function getExistingPostComments(postUrls: string[]): Promise<{
  existingComments: PostComment[];
  urlsWithComments: string[];
  urlsWithoutComments: string[];
}> {
  try {
    if (!postUrls || postUrls.length === 0) {
      return {
        existingComments: [],
        urlsWithComments: [],
        urlsWithoutComments: [],
      };
    }

    // Get existing comments for these post URLs
    const existingComments = await selectPostComments({ postUrls });

    // Extract URLs that have existing comments
    const urlsWithComments = existingComments
      .map(comment => comment.post?.post_url)
      .filter((url): url is string => Boolean(url));

    // Remove duplicates
    const uniqueUrlsWithComments = Array.from(new Set(urlsWithComments));

    // Find URLs that don't have comments
    const urlsWithoutComments = postUrls.filter(url => !uniqueUrlsWithComments.includes(url));

    return {
      existingComments,
      urlsWithComments: uniqueUrlsWithComments,
      urlsWithoutComments,
    };
  } catch (error) {
    console.error("Error getting existing post comments:", error);
    return {
      existingComments: [],
      urlsWithComments: [],
      urlsWithoutComments: postUrls, // Assume no comments exist on error
    };
  }
}
