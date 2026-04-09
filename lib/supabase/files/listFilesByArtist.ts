import { Tables } from "@/types/database.types";
import { getFilesByArtistId } from "./getFilesByArtistId";
import { filterFilesByPath } from "@/lib/files/filterFilesByPath";
import getAccountEmails from "@/lib/supabase/account_emails/getAccountEmails";

type FileRecord = Tables<"files">;
export type FileRecordWithOwnerEmail = FileRecord & {
  owner_email: string | null;
};

/**
 * List files for an artist, optionally filtered by path
 *
 * This is a convenience function that combines:
 * 1. Database query (getFilesByArtistId)
 * 2. Path filtering logic (filterFilesByPath)
 *
 * Note: With file sharing enabled, this returns files from ALL team members
 * who have access to the artist, not just the specified owner.
 *
 * @param ownerAccountId - Currently unused, kept for backward compatibility
 * @param artistAccountId - The artist account to get files for
 * @param path - Optional path filter for immediate children only
 * @param recursive - If true, returns all files (and nested files) under the path (or all files if no path)
 */
export async function listFilesByArtist(
  ownerAccountId: string,
  artistAccountId: string,
  path?: string,
  recursive: boolean = false,
): Promise<FileRecordWithOwnerEmail[]> {
  const allFiles = await getFilesByArtistId(artistAccountId);
  const filteredFiles = recursive
    ? path
      ? allFiles.filter((file) => {
          const match = file.storage_key.match(/^files\/[^\/]+\/[^\/]+\/(.+)$/);
          if (!match) {
            return false;
          }

          const pathPrefix = path.endsWith("/") ? path : `${path}/`;
          return match[1].startsWith(pathPrefix);
        })
      : allFiles
    : filterFilesByPath(allFiles, path);
  const ownerAccountIds = [
    ...new Set(
      filteredFiles.map((file) => file.owner_account_id).filter(Boolean),
    ),
  ];

  const accountEmails = await getAccountEmails(ownerAccountIds);
  const ownerEmailByAccountId = new Map(
    accountEmails.flatMap((accountEmail) =>
      accountEmail.account_id
        ? [[accountEmail.account_id, accountEmail.email]]
        : [],
    ),
  );

  return filteredFiles.map((file) => ({
    ...file,
    owner_email: file.owner_account_id
      ? (ownerEmailByAccountId.get(file.owner_account_id) ?? null)
      : null,
  }));
}
