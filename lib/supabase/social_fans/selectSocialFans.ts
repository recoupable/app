import serverClient from "../serverClient";
import { Tables } from "@/types/database.types";

type SocialFan = Tables<"social_fans">;
type Social = Tables<"socials">;
type PostComment = Tables<"post_comments">;

// Extended type to include joined data
export interface SocialFanWithDetails extends SocialFan {
  artist_social: Social;
  fan_social: Social;
  latest_engagement_comment: PostComment | null;
}

// Allowed top-level columns for ordering
const SOCIAL_FANS_ORDERABLE_COLUMNS = [
  "id",
  "artist_social_id",
  "fan_social_id",
  "created_at",
  "updated_at",
  "latest_engagement",
  "latest_engagement_id",
] as const;
type SocialFansOrderableColumn = (typeof SOCIAL_FANS_ORDERABLE_COLUMNS)[number];

interface SelectSocialFansParams {
  social_ids?: string[];
  orderBy?: SocialFansOrderableColumn;
  orderDirection?: "asc" | "desc";
}

export const selectSocialFans = async (
  params?: SelectSocialFansParams,
): Promise<SocialFanWithDetails[]> => {
  let query = serverClient.from("social_fans").select(`
      *,
      artist_social:socials!social_fans_artist_social_id_fkey(
        id,
        username,
        bio,
        followerCount,
        followingCount,
        avatar,
        profile_url,
        region,
        updated_at
      ),
      fan_social:socials!social_fans_fan_social_id_fkey(
        id,
        username,
        bio,
        followerCount,
        followingCount,
        avatar,
        profile_url,
        region,
        updated_at
      ),
      latest_engagement_comment:post_comments!social_fans_latest_engagement_id_fkey(
        id,
        comment,
        commented_at,
        post_id,
        social_id
      )
    `);

  if (params?.social_ids && params.social_ids.length > 0) {
    query = query.in("artist_social_id", params.social_ids);
  }

  // Only allow ordering by top-level columns
  if (params?.orderBy && SOCIAL_FANS_ORDERABLE_COLUMNS.includes(params.orderBy)) {
    query = query.order(params.orderBy, {
      ascending: params.orderDirection !== "desc",
      nullsFirst: false,
    });
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error selecting social fans:", error);
    throw error;
  }

  return data as SocialFanWithDetails[];
};
