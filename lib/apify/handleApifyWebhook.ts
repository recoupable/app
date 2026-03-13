import apifyPayloadSchema from "@/lib/apify/apifyPayloadSchema";
import { z } from "zod";
import handleInstagramProfileScraperResults from "@/lib/apify/posts/handleInstagramProfileScraperResults";
import handleInstagramCommentsScraper from "@/lib/apify/comments/handleInstagramCommentsScraper";

/**
 * Handles the Apify webhook payload: routes to appropriate handler based on actorId.
 *
 * @param parsed - The parsed and validated Apify webhook payload
 * @returns An object with posts, socials, accountSocials, accountArtistIds, accountEmails, and sentEmails
 */
export default async function handleApifyWebhook(parsed: z.infer<typeof apifyPayloadSchema>) {
  const fallbackResponse = {
    posts: [],
    social: null,
    accountSocials: [],
    accountArtistIds: [],
    accountEmails: [],
    sentEmails: null,
  };

  try {
    // Handle Instagram profile scraper results
    if (parsed.eventData.actorId === "dSCLg0C3YEZ83HzYX") {
      return await handleInstagramProfileScraperResults(parsed);
    }
    // Handle Instagram Comments Scraper results
    else if (parsed.eventData.actorId === "SbK00X0JYCPblD2wp") {
      return await handleInstagramCommentsScraper(parsed);
    } else {
      console.log(`Unhandled actorId: ${parsed.eventData.actorId}`);
      return fallbackResponse;
    }
  } catch (e) {
    console.error("Failed to handle Apify webhook:", e);
    return fallbackResponse;
  }
}
