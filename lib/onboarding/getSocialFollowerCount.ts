interface SocialFollowerFields {
  follower_count?: number | null;
  followerCount?: number | null;
}

/**
 * The roster API spreads raw `socials` rows (snake_case `follower_count`)
 * while chat's `SOCIAL` type declares camelCase `followerCount`. Read
 * whichever is present so the UI survives both shapes.
 */
export function getSocialFollowerCount(
  social: SocialFollowerFields,
): number | null {
  if (typeof social.follower_count === "number") return social.follower_count;
  if (typeof social.followerCount === "number") return social.followerCount;
  return null;
}
