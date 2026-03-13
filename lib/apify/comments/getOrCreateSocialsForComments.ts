import insertSocials from "@/lib/supabase/socials/insertSocials";
import { TablesInsert, Tables } from "@/types/database.types";
import { InstagramComment } from "@/lib/apify/comments/handleInstagramCommentsScraper";

/**
 * Gets or creates socials for the given Instagram comment authors and returns them as a map
 *
 * @param comments - Array of Instagram comments
 * @returns Map of username to social record
 */
export default async function getOrCreateSocialsForComments(
  comments: InstagramComment[],
): Promise<Map<string, Tables<"socials">>> {
  // Create a unique set of comment authors
  const uniqueAuthors = Array.from(
    new Map(
      comments.map(comment => [
        comment.ownerUsername,
        {
          username: comment.ownerUsername,
          profilePicUrl: comment.ownerProfilePicUrl,
          profileUrl: `instagram.com/${comment.ownerUsername}`,
        },
      ]),
    ).values(),
  );

  // Prepare all socials for batch upsert
  const socialsToUpsert: TablesInsert<"socials">[] = uniqueAuthors
    .filter(author => author.username && author.profileUrl)
    .map(author => ({
      username: author.username,
      profile_url: author.profileUrl,
      avatar: author.profilePicUrl,
      bio: null,
      region: null,
      followerCount: null,
      followingCount: null,
    }));

  try {
    // Batch upsert all socials (creates new or returns existing based on profile_url)
    const upsertedSocials = await insertSocials(socialsToUpsert);

    // Create map for easy lookup by username
    const socialMap = new Map<string, Tables<"socials">>();
    upsertedSocials.forEach(social => {
      socialMap.set(social.username, social);
    });

    return socialMap;
  } catch (error) {
    console.error("Error batch upserting socials:", error);
    return new Map<string, Tables<"socials">>();
  }
}
