import { Database } from "./database.types";

type SocialBase = Omit<Database["public"]["Tables"]["socials"]["Row"], "followerCount" | "followingCount">;

export type Social = SocialBase & {
  social_id: string;
  follower_count: number;
  following_count: number; 
};

export interface ArtistSocialsResultType {
  status: string;
  socials: Array<Social>;
  success: boolean;
  pagination: {
  page: number;
  limit: number;
  total_count: number;
  total_pages: number;
  };
}