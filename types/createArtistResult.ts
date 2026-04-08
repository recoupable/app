export interface CreateArtistResult {
  artist?: {
    account_id: string;
    name: string;
    image?: string;
  };
  artistAccountId?: string;
  message: string;
  error?: string;
}
