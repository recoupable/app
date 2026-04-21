export interface Social {
  id: string;
  username: string;
  avatar: string | null;
  profile_url: string;
  region: string | null;
  bio: string | null;
  follower_count: number | null;
  following_count: number | null;
  updated_at: string;
}

export interface SocialsResponse {
  status: string;
  socials: Social[];
  success: boolean;
  pagination: {
    page: number;
    limit: number;
    total_count: number;
    total_pages: number;
  };
}
