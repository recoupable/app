import getAccountSocials from "../supabase/account_socials/getAccountSocials";
import { selectSocialFans } from "../supabase/social_fans/selectSocialFans";
import { generateSegments } from "./generateSegments";
import { insertSegments } from "../supabase/segments/insertSegments";
import { deleteSegments } from "../supabase/segments/deleteSegments";
import { insertArtistSegments } from "../supabase/artist_segments/insertArtistSegments";
import { insertFanSegments } from "../supabase/fan_segments/insertFanSegments";
import { Tables } from "@/types/database.types";
import { successResponse, errorResponse } from "./createSegmentResponses";
import { GenerateArrayResult } from "../ai/generateArray";
import { getFanSegmentsToInsert } from "./getFanSegmentsToInsert";
import { getArtistById } from "../supabase/artist/getArtistById";

interface CreateArtistSegmentsParams {
  artist_account_id: string;
  prompt: string;
}

export const createSegments = async ({ artist_account_id, prompt }: CreateArtistSegmentsParams) => {
  try {
    // Get artist info for better error messages
    const artistInfo = await getArtistById(artist_account_id);
    const artistName = artistInfo?.name || "this artist";

    // Step 1: Get all social IDs for the artist
    const accountSocials = await getAccountSocials({
      accountId: artist_account_id,
    });
    const socialIds = accountSocials.map((as: { social_id: string }) => as.social_id);

    if (socialIds.length === 0) {
      return {
        ...errorResponse("No social account found for this artist"),
        feedback:
          `No Instagram accounts found for ${artistName}. To automatically set up Instagram accounts, please follow these steps:\n` +
          `1. Call 'search_web' to search for "${artistName} Instagram handle"\n` +
          "2. Call 'update_artist_socials' with the discovered Instagram profile URL\n" +
          "3. Call 'create_segments' again to retry segment creation\n" +
          "Instagram is required for fan segmentation as it's the primary social platform configured for segments.",
      };
    }

    // Step 2: Get all fans for the artist
    const fans = await selectSocialFans({
      social_ids: socialIds,
      orderBy: "latest_engagement",
      orderDirection: "desc",
    });

    if (fans.length === 0) {
      return {
        ...errorResponse("No fans found for this artist"),
        feedback:
          `No social_fans records found for ${artistName}. Before creating segments, you need social_fans data. Follow these steps:\n` +
          "1. Call 'scrape_instagram_profile' with the artist's Instagram handles to get posts\n" +
          "2. Call 'scrape_instagram_comments' with Instagram post URLs to scrape comment data\n" +
          "3. Wait for the scraping jobs to complete and process into social_fans records\n" +
          "4. Call 'create_segments' again once social_fans records are populated\n" +
          "Note: Scraping jobs may take several minutes to complete.",
      };
    }

    // Step 3: Generate segment names using AI
    const segments = await generateSegments({ fans, prompt });

    if (segments.length === 0) {
      return errorResponse("Failed to generate segment names");
    }

    // Step 4: Delete existing segments for the artist
    await deleteSegments(artist_account_id);

    // Step 5: Insert segments into the database
    const segmentsToInsert = segments.map((segment: GenerateArrayResult) => ({
      name: segment.segmentName,
      updated_at: new Date().toISOString(),
    }));

    const insertedSegments = await insertSegments(segmentsToInsert);

    // Step 6: Associate segments with the artist
    const artistSegmentsToInsert = insertedSegments.map((segment: Tables<"segments">) => ({
      artist_account_id,
      segment_id: segment.id,
      updated_at: new Date().toISOString(),
    }));

    const insertedArtistSegments = await insertArtistSegments(artistSegmentsToInsert);

    // Step 7: Associate fans with the new segments
    // Build a set of valid IDs from the fetched fan list
    const validFanIds = new Set(fans.map(f => f.fan_social_id));

    const fanSegmentsToInsert = getFanSegmentsToInsert(segments, insertedSegments).filter(fs => {
      const ok = validFanIds.has(fs.fan_social_id);
      if (!ok) console.warn(`Skipping unknown fan_social_id: ${fs.fan_social_id}`);
      return ok;
    });

    if (fanSegmentsToInsert.length === 0) {
      return errorResponse("No valid fan IDs matched any segment.");
    }

    const insertedFanSegments = await insertFanSegments(fanSegmentsToInsert);

    return successResponse(
      `Successfully created ${segments.length} segments for artist`,
      {
        supabase_segments: insertedSegments,
        supabase_artist_segments: insertedArtistSegments,
        supabase_fan_segments: insertedFanSegments,
        segments,
      },
      segments.length,
    );
  } catch (error) {
    console.error("Error creating artist segments:", error);
    return errorResponse(
      error instanceof Error ? error.message : "Failed to create artist segments",
    );
  }
};
