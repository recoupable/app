import getDataset from "@/lib/apify/getDataset";
import { z } from "zod";
import apifyPayloadSchema from "@/lib/apify/apifyPayloadSchema";
import runInstagramProfilesScraper from "@/lib/apify/posts/runInstagramProfilesScraper";
import saveApifyInstagramComments from "@/lib/apify/comments/saveApifyInstagramComments";

// Type definition for Instagram comment data structure
export interface InstagramComment {
  id: string;
  text: string;
  timestamp: string;
  ownerUsername: string;
  ownerProfilePicUrl: string;
  postUrl: string;
}

/**
 * Handles Instagram Comments Scraper results: fetches dataset, processes comments, and returns results.
 *
 * @param parsed - The parsed and validated Apify webhook payload
 * @returns An object with comments and processing metadata
 */
export default async function handleInstagramCommentsScraper(
  parsed: z.infer<typeof apifyPayloadSchema>,
) {
  const datasetId = parsed.resource.defaultDatasetId;
  let comments: InstagramComment[] = [];
  let processedPostUrls: string[] = [];
  let totalComments = 0;

  const fallbackResponse = {
    comments: [],
    processedPostUrls: [],
    totalComments: 0,
  };

  try {
    if (datasetId) {
      const dataset = await getDataset(datasetId);

      if (dataset && Array.isArray(dataset)) {
        // Assign comments directly from the dataset
        comments = dataset as InstagramComment[];

        // Extract unique post URLs
        processedPostUrls = Array.from(
          new Set(dataset.map((item: InstagramComment) => item.postUrl).filter(Boolean)),
        );

        totalComments = dataset.length;

        console.log(`Processed ${totalComments} comments from ${processedPostUrls.length} posts`);

        // Log sample data for debugging
        if (comments.length > 0) {
          console.log("Sample comment:", comments[0]);
        }

        // Save comments to post_comments table
        await saveApifyInstagramComments(comments);

        // Extract unique fan profiles (usernames) for profile scraping
        const fanHandles = Array.from(
          new Set(comments.map(comment => comment.ownerUsername).filter(Boolean)),
        );

        // Trigger profile scraper for fan profiles
        if (fanHandles.length > 0) {
          console.log(`Triggering profile scraper for ${fanHandles.length} fan handles`);
          const profileScrapingResult = await runInstagramProfilesScraper(fanHandles);

          if (profileScrapingResult.error) {
            console.error("Profile scraping failed:", profileScrapingResult.error);
          } else {
            console.log(
              `Profile scraping initiated: runId=${profileScrapingResult.runId}, datasetId=${profileScrapingResult.datasetId}`,
            );
          }
        }
      }
    }

    return {
      comments,
      processedPostUrls,
      totalComments,
    };
  } catch (error) {
    console.error("Failed to handle Instagram Comments Scraper webhook:", error);
    return fallbackResponse;
  }
}
