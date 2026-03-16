import getDataset from "@/lib/apify/getDataset";
import { ApifyInstagramPost } from "@/types/Apify";
import saveApifyInstagramPosts from "@/lib/apify/posts/saveApifyInstagramPosts";
import { Tables } from "@/types/database.types";
import { z } from "zod";
import insertSocials from "@/lib/supabase/socials/insertSocials";
import getSocialByProfileUrl from "@/lib/supabase/socials/getSocialByProfileUrl";
import getAccountSocials, {
  AccountSocialWithSocial,
} from "@/lib/supabase/account_socials/getAccountSocials";
import insertSocialPosts from "@/lib/supabase/social_posts/insertSocialPosts";
import getAccountArtistIds from "@/lib/supabase/account_artist_ids/getAccountArtistIds";
import getAccountEmails from "@/lib/supabase/account_emails/getAccountEmails";
import sendApifyWebhookEmail from "@/lib/apify/sendApifyWebhookEmail";
import normalizeProfileUrl from "@/lib/utils/normalizeProfileUrl";
import uploadLinkToArweave from "@/lib/arweave/uploadLinkToArweave";
import handleInstagramProfileFollowUpRuns from "@/lib/apify/posts/handleInstagramProfileFollowUpRuns";
import apifyPayloadSchema from "@/lib/apify/apifyPayloadSchema";
import { getFetchableUrl } from "@/lib/arweave/gateway";

/**
 * Handles Instagram profile scraper results: fetches dataset, saves posts, saves socials, and returns results.
 *
 * @param parsed - The parsed and validated Apify webhook payload
 * @returns An object with posts, socials, accountSocials, accountArtistIds, accountEmails, and sentEmails
 */
export default async function handleInstagramProfileScraperResults(
  parsed: z.infer<typeof apifyPayloadSchema>,
) {
  const datasetId = parsed.resource.defaultDatasetId;
  let posts: Tables<"posts">[] = [];
  let social: Tables<"socials"> | null = null;
  let accountSocials: AccountSocialWithSocial[] = [];
  let accountArtistIds: Tables<"account_artist_ids">[] = [];
  let accountEmails: Tables<"account_emails">[] = [];
  let sentEmails: unknown = null;
  let dataset;

  if (datasetId) {
    dataset = await getDataset(datasetId);
    const firstResult = dataset[0];
    if (firstResult?.latestPosts) {
      // Save posts
      const { supabasePosts: sp } = await saveApifyInstagramPosts(
        firstResult.latestPosts as ApifyInstagramPost[],
      );
      posts = sp;
      const arweaveResult = await uploadLinkToArweave(
        firstResult.profilePicUrlHD || firstResult.profilePicUrl,
      );
      if (arweaveResult) {
        firstResult.profilePicUrl = getFetchableUrl(arweaveResult);
      }

      await insertSocials([
        {
          username: firstResult.username,
          avatar: firstResult.profilePicUrl,
          profile_url: firstResult.url,
          bio: firstResult.biography,
          followerCount: firstResult.followersCount,
          followingCount: firstResult.followsCount,
        },
      ]);
      const normalizedUrl = normalizeProfileUrl(firstResult.url);
      social = await getSocialByProfileUrl(normalizedUrl);
      console.log("social", social);
      if (social) {
        if (posts.length) {
          const socialPostRows = posts.map(post => ({
            post_id: post.id,
            updated_at: post.updated_at,
            social_id: social!.id,
          }));
          await insertSocialPosts(socialPostRows);
        }
        const socialIds = [social.id];
        accountSocials = await getAccountSocials({ socialId: socialIds });
        console.log("accountSocials", accountSocials);
        accountArtistIds = await getAccountArtistIds({
          artistIds: accountSocials.map(a => a.account_id as string),
        });
        // Get emails for all unique account_ids
        const uniqueAccountIds = Array.from(
          new Set(accountArtistIds.map(a => a.account_id).filter(Boolean)),
        );
        const emails = await getAccountEmails(uniqueAccountIds as string[]);
        console.log("emails", emails);
        accountEmails = emails;
        // Send the Apify webhook email using the new utility
        sentEmails = await sendApifyWebhookEmail(
          firstResult,
          emails.map(e => e.email).filter(Boolean) as string[],
        );

        // Trigger comment scraping for the new posts
        await handleInstagramProfileFollowUpRuns(dataset, firstResult);
      }
    }
  }

  return {
    posts,
    social,
    accountSocials,
    accountArtistIds,
    accountEmails,
    sentEmails,
  };
}
