"use client";

import { useMemo } from "react";
import getRelativeStoragePath from "@/utils/getRelativeStoragePath";
import useFilesManager, { ListedFileRow } from "@/hooks/useFilesManager";

export type MentionableFile = {
  id: string;
  file_name: string;
  storage_key: string;
  mime_type: string | null;
  is_directory?: boolean;
  relative_path: string;
};

export default function useArtistFilesForMentions() {
  const fm = useFilesManager(undefined, true);
  const ownerAccountId = fm.ownerAccountId;
  const artistAccountId = fm.artistAccountId;
  const rows = (fm.files as unknown) as ListedFileRow[];

  const files: MentionableFile[] = useMemo(() => {
    return rows.map((r) => ({
      id: r.id,
      file_name: r.file_name,
      storage_key: r.storage_key,
      mime_type: r.mime_type ?? null,
      is_directory: r.is_directory,
      relative_path: getRelativeStoragePath(r.storage_key, ownerAccountId, artistAccountId, r.is_directory),
    }));
  }, [rows, ownerAccountId, artistAccountId]);

  return { files, isLoading: fm.isLoading };
}

