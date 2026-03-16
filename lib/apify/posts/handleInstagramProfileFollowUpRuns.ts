import runInstagramCommentsScraper from "@/lib/apify/comments/runInstagramCommentsScraper";
import getExistingPostComments from "@/lib/apify/comments/getExistingPostComments";
import { ApifyInstagramPost, ApifyInstagramProfileResult } from "@/types/Apify";

/**
 * Handles Instagram profile follow-up runs: comment scraping for new posts
 *
 * @param dataset - The complete dataset from the profile scraper
 * @param firstResult - The first result from the dataset containing latest posts and profile info
 * @returns Promise<void>
 */
export default async function handleInstagramProfileFollowUpRuns(
  dataset: unknown[],
  firstResult: ApifyInstagramProfileResult,
): Promise<void> {
  // Trigger comment scraping for the new posts
  // Only call runInstagramCommentsScraper if dataset.length === 1
  // If more than 1 profile, these are fans and should only be saved
  if (dataset.length === 1 && firstResult.latestPosts && firstResult.latestPosts.length > 0) {
    const postUrls = (firstResult.latestPosts as ApifyInstagramPost[])
      .map(post => post.url)
      .filter(Boolean);

    if (postUrls.length > 0) {
      console.log("Checking existing comments for posts:", postUrls);

      // Get existing comments for these post URLs
      const { urlsWithComments, urlsWithoutComments } = await getExistingPostComments(postUrls);

      // Handle posts with existing comments (use resultsLimit)
      if (urlsWithComments.length > 0) {
        console.log(
          "Triggering comment scraping for posts with existing comments (resultsLimit=1):",
          urlsWithComments,
        );
        await runInstagramCommentsScraper(urlsWithComments, 1);
      }

      // Handle posts without existing comments (no resultsLimit)
      if (urlsWithoutComments.length > 0) {
        console.log(
          "Triggering comment scraping for posts without existing comments:",
          urlsWithoutComments,
        );
        await runInstagramCommentsScraper(urlsWithoutComments);
      }
    }
  }
}
