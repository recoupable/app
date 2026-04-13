"use client";

import { useMemo } from "react";
import useSandboxes from "@/hooks/useSandboxes";
import getMimeFromPath from "@/lib/files/getMimeFromPath";
import type { FileNode } from "@/lib/sandboxes/parseFileTree";

export type MentionableFile = {
  id: string;
  file_name: string;
  path: string;
  mime_type: string | null;
  is_directory: boolean;
  relative_path: string;
};

export default function useArtistFilesForMentions() {
  const { filetree, isLoading } = useSandboxes();

  const files: MentionableFile[] = useMemo(() => {
    const flatten = (nodes: FileNode[]): MentionableFile[] =>
      nodes.flatMap((node) => {
        if (node.type === "folder") {
          return flatten(node.children || []);
        }

        const path = node.path;
        const fileName = path.split("/").pop() || path;

        return [
          {
            id: path,
            file_name: fileName,
            path,
            mime_type: getMimeFromPath(path),
            is_directory: false,
            relative_path: path,
          },
        ];
      });

    return flatten(filetree || []);
  }, [filetree]);

  return { files, isLoading };
}
