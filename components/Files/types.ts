export interface FileRow {
  id: string;
  file_name: string;
  storage_key: string;
  mime_type?: string | null;
  is_directory?: boolean;
  size_bytes?: number | null;
  owner_email?: string | null;
}

// Shared types for File Access UI
export type ArtistAccess = {
  artistId: string;
  scope: "read_only" | "admin";
  grantedAt: string;
  expiresAt: string | null;
  artistName?: string | null;
  artistEmail?: string | null;
};

export type AccessArtistsResponse = {
  success: boolean;
  data?: {
    artists: ArtistAccess[];
    count: number;
    fileId: string;
    accountId: string;
  };
};
