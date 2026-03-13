"use client";

import { useCallback, useMemo, useState } from "react";
import type { SuggestionDataItem } from "react-mentions";
import parseMentionedIds from "@/components/VercelChat/parseMentionedIds";
import useArtistFilesForMentions from "@/hooks/useArtistFilesForMentions";

export interface GroupedSuggestion extends SuggestionDataItem {
  group: string;
  mime_type: string | null;
  storage_key: string;
}

/**
 *
 * @param value
 */
export default function useFileMentionSuggestions(value: string) {
  const { files: artistFiles = [] } = useArtistFilesForMentions();

  const mentionedIds = useMemo(() => parseMentionedIds(value), [value]);

  const [lastResults, setLastResults] = useState<GroupedSuggestion[]>([]);

  const buildGroupedResults = useCallback(
    (query: string): GroupedSuggestion[] => {
      const q = (query || "").toLowerCase();
      const items: GroupedSuggestion[] = artistFiles
        .filter(f => !f.is_directory)
        .map(f => {
          const rel = f.relative_path || f.file_name;
          const lastSlash = rel.lastIndexOf("/");
          const group = lastSlash > 0 ? rel.slice(0, lastSlash) : "Home";
          const name = lastSlash > -1 ? rel.slice(lastSlash + 1) : rel;
          return {
            id: f.id,
            display: name,
            group,
            mime_type: f.mime_type,
            storage_key: f.storage_key,
          } as GroupedSuggestion;
        })
        .filter(it => !mentionedIds.has(String(it.id)))
        .filter(
          it =>
            (it.display || String(it.id)).toLowerCase().includes(q) ||
            it.group.toLowerCase().includes(q),
        )
        .sort((a, b) =>
          a.group === b.group
            ? (a.display ?? "").localeCompare(b.display ?? "")
            : a.group.localeCompare(b.group),
        );
      return items.slice(0, 20);
    },
    [artistFiles, mentionedIds],
  );

  const provideSuggestions = useCallback(
    (query: string, callback: (results: SuggestionDataItem[]) => void) => {
      const grouped = buildGroupedResults(query);
      setLastResults(grouped);
      callback(grouped);
    },
    [buildGroupedResults],
  );

  return { provideSuggestions, lastResults };
}
